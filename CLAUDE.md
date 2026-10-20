# How changes go live (read first)

This repo deploys to Cloudflare automatically when main changes, so main is the live site.

## Rules for every change, including ones started from the phone

1. **Never push to main.** Make a branch, commit as you build, and open a pull request (PR).
2. **Wait for the green tick** from the Checks robot (GitHub Actions). Red cross means fix it on the same branch first.
3. **Never merge without Brad's say-so.** He approves and merges (the GitHub mobile app is fine).
4. **Never commit secrets.** Keys live in Cloudflare Variables and Secrets, never in the repo. If one is committed by mistake, get a fresh key and cancel the old one first, then fix.
5. **Log ideas and bugs as GitHub Issues.** A PR that says "fixes #number" closes the issue on merge.
6. **If the live site breaks after a merge,** rewind main to the last working commit first, then fix on a branch and merge again.

## Cheat sheets

Every cheat sheet built or updated goes in the "Cheat Sheets" folder inside Maverick Digital, named "[Topic] Cheat Sheet.md", with a "How I'd explain it to Dad" section (plain words, no jargon) at the top.
