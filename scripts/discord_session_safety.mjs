export function isDiscordLoginUrl(value) {
  try {
    const url = new URL(value);
    return ['discord.com', 'discordapp.com'].includes(url.hostname) &&
      /^\/(login|register)(\/|$)/.test(url.pathname);
  } catch { return false; }
}

export function shouldSaveDiscordSession(result, finalUrl) {
  return [
    'content_read_succeeded_safely', 'shell_reached_safely',
    'events_surface_detail_read_succeeded_safely',
    'events_surface_summary_read_succeeded_safely'
  ].includes(result.status) &&
    result.authenticatedShell?.authenticatedAccountShell === true &&
    result.guildIndicatorUnchanged === true &&
    result.externalDiscordStateChanged === false &&
    (result.prohibitedSuccessfulResponses || []).length === 0 &&
    /^https:\/\/discord(?:app)?\.com\/channels\//.test(finalUrl || '');
}
