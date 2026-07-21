import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const TABLE = "coordination_capability_probes";
const TOKEN_SHA256 = "8e2eb5c357d0eda346412fb12c75db876ae4ec20c71e5ece635b42d02f1d3bcc";
const MAX_BODY_BYTES = 32_768;
const ALLOWED_PHASES = new Set(["assignment", "finding", "follow_up", "disposition"]);
const ALLOWED_ACTORS = new Set(["user", "chatgpt", "codex", "steward"]);
const ALLOWED_TARGETS = new Set(["user", "chatgpt", "codex", "steward", "shared"]);
const ALLOWED_INPUT_FIELDS = new Set([
  "phase",
  "origin",
  "target",
  "title",
  "payload",
  "parent_id",
  "deduplication_key",
]);

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function isAuthorized(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const token = header.slice(7).trim();
  if (!token || token.length > 256) return false;
  return (await sha256Hex(token)) === TOKEN_SHA256;
}

function restHeaders(secretKey: string, prefer?: string): HeadersInit {
  const headers: Record<string, string> = {
    apikey: secretKey,
    authorization: `Bearer ${secretKey}`,
    "content-type": "application/json",
  };
  if (prefer) headers.prefer = prefer;
  return headers;
}

function textField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > max) return null;
  return normalized;
}

function optionalUuid(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (!(await isAuthorized(req))) return json({ error: "unauthorized" }, 401);

  const url = new URL(req.url);
  const route = url.pathname.split("/").filter(Boolean).at(-1);
  if (route === "health" && req.method === "GET") {
    return json({ ok: true, surface: "coordination-capability-proof", canonical_write_access: false });
  }
  if (route !== "items") return json({ error: "not_found" }, 404);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !secretKey) return json({ error: "server_configuration_error" }, 500);

  const tableUrl = `${supabaseUrl}/rest/v1/${TABLE}`;

  if (req.method === "GET") {
    const target = url.searchParams.get("target");
    const parentId = url.searchParams.get("parent_id");
    const params = new URLSearchParams({
      select: "id,created_at,phase,origin,target,title,payload,parent_id,deduplication_key",
      order: "created_at.asc",
      limit: "100",
    });
    if (target) {
      if (!ALLOWED_TARGETS.has(target)) return json({ error: "invalid_target" }, 400);
      params.set("or", `(target.eq.${target},target.eq.shared)`);
    }
    if (parentId) {
      if (optionalUuid(parentId) === undefined) return json({ error: "invalid_parent_id" }, 400);
      params.set("or", `(id.eq.${parentId},parent_id.eq.${parentId})`);
    }

    const response = await fetch(`${tableUrl}?${params}`, {
      headers: restHeaders(secretKey),
    });
    if (!response.ok) return json({ error: "read_failed" }, 502);
    return json({ items: await response.json() });
  }

  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large" }, 413);
  }
  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large" }, 413);
  }

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return json({ error: "invalid_body" }, 400);
  }
  const unknownFields = Object.keys(input).filter((field) => !ALLOWED_INPUT_FIELDS.has(field));
  if (unknownFields.length > 0) return json({ error: "unknown_fields" }, 400);

  const phase = textField(input.phase, 40);
  const origin = textField(input.origin, 40);
  const target = textField(input.target, 40);
  const title = textField(input.title, 200);
  const parentId = optionalUuid(input.parent_id);
  const deduplicationKey = input.deduplication_key == null
    ? null
    : textField(input.deduplication_key, 200);
  const payload = input.payload ?? {};

  if (!phase || !ALLOWED_PHASES.has(phase)) return json({ error: "invalid_phase" }, 400);
  if (!origin || !ALLOWED_ACTORS.has(origin)) return json({ error: "invalid_origin" }, 400);
  if (!target || !ALLOWED_TARGETS.has(target)) return json({ error: "invalid_target" }, 400);
  if (!title) return json({ error: "invalid_title" }, 400);
  if (parentId === undefined) return json({ error: "invalid_parent_id" }, 400);
  if (input.deduplication_key != null && !deduplicationKey) {
    return json({ error: "invalid_deduplication_key" }, 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json({ error: "invalid_payload" }, 400);
  }
  if (new TextEncoder().encode(JSON.stringify(payload)).byteLength > 16_384) {
    return json({ error: "payload_too_large" }, 413);
  }

  const record = {
    phase,
    origin,
    target,
    title,
    payload,
    parent_id: parentId,
    deduplication_key: deduplicationKey,
  };
  const response = await fetch(tableUrl, {
    method: "POST",
    headers: restHeaders(secretKey, "return=representation"),
    body: JSON.stringify(record),
  });
  if (response.status === 409) return json({ error: "duplicate" }, 409);
  if (!response.ok) return json({ error: "write_failed" }, 502);
  const rows = await response.json();
  return json({ item: rows[0] }, 201);
});
