import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = path.resolve('work/discord-readonly');
const profileDir = path.join(workspaceRoot, 'profile');
const logDir = path.join(workspaceRoot, 'logs');
const manifestPath = path.join(workspaceRoot, 'profile-manifest.json');
const readmePath = path.join(workspaceRoot, 'README.md');

const manifest = {
  name: 'Discord Read-Only Survey Profile',
  status: 'created_not_authorized_for_live_discord',
  created_at: new Date().toISOString(),
  profile_dir: profileDir,
  log_dir: logDir,
  allowed_purpose: [
    'future protocol-only shell safety tests after user approval',
    'future read-only Discord surveys only after shell safety acceptance'
  ],
  forbidden_until_approved: [
    'real Discord message inspection',
    'Signals or research extraction',
    'route promotion to direct_navigation_verified'
  ]
};

const readme = `# Discord Read-Only Local Workspace

This folder is intentionally ignored by Git. It is the local container for the
future dedicated Discord-reading browser profile and safety logs.

Current status: created only. It is not authorized for real Discord use yet.

Rules:

- Use this profile only for protocol-approved Discord read-only tests.
- Do not use it for ordinary Discord participation.
- Do not store or commit cookies, sessions, screenshots, or logs from this
  folder.
- No real Discord message inspection is authorized from this setup step.
- No route may become \`direct_navigation_verified\` until a separately
  approved shell test passes and is accepted.

Subfolders:

- \`profile/\`: future isolated browser profile data.
- \`logs/\`: future safety-test logs.
`;

await fs.mkdir(profileDir, { recursive: true });
await fs.mkdir(logDir, { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await fs.writeFile(readmePath, readme, 'utf8');

console.log(JSON.stringify({
  created: true,
  workspaceRoot,
  profileDir,
  logDir,
  manifestPath,
  liveDiscordAccessAuthorized: false
}, null, 2));
