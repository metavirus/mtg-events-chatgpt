This directory may hold encrypted, non-plaintext deployment files used by
GitHub Actions.

Do not commit plaintext browser storage state, cookies, tokens, passwords, or
profile directories.

For the Discord read-only surveyor, the expected large-secret workaround is:

- local plaintext source, ignored by git:
  `work/discord-readonly/storage-state.json`
- committed encrypted file:
  `.github/secrets/discord-readonly-storage-state.json.enc`
- repository Actions secret:
  `DISCORD_READONLY_STORAGE_STATE_PASSPHRASE`

Create the encrypted file only after confirming the dedicated Discord account
and session are authorized for bounded read-only survey use.
