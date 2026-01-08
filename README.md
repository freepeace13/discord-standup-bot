# Discord Standup Bot

A lightweight Discord bot for async daily standups using a single `/standup` slash command.

The bot formats standup updates consistently and keeps the team aligned without meetings.

---

## Features

- `/standup` slash command with guided inputs
- **Today is required**, **Yesterday** and **Blockers** default to **None**
- Clean, standardized standup format
- One bot instance for the entire team
- No reminders / cron jobs (slash command only)
- Server-friendly (PM2 / systemd)

---

## How it works

- The bot runs on **one machine/server**
- Team members do **not** install anything
- Devs post updates in Discord using `/standup`
- The bot formats and posts the message

---

## Example output

```
🧑‍💻 @Kin — Daily Dev Standup

🕘 Yesterday:
- None

🚧 Blockers:
- None

🎯 Today:
- Implement invoice PDF pagination
```

---

## Project structure

```
discord-standup-bot/
├─ index.js              # Bot runtime (slash command handler)
├─ register-commands.js  # One-time slash command registration
├─ package.json
├─ package-lock.json
├─ .env                  # Environment variables (NOT committed)
└─ README.md
```

---

## Environment variables

Create a `.env` file in the project root:

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_ID
GUILD_ID=YOUR_DISCORD_SERVER_ID
```

### Where to get these values

| Variable | What it is | Where to find it |
|---|---|---|
| `DISCORD_TOKEN` | Bot login token | Developer Portal → Your App → **Bot** → Reset Token / Copy Token |
| `CLIENT_ID` | Application ID | Developer Portal → Your App → **General Information** → Application ID |
| `GUILD_ID` | Server ID | Discord → Enable **Developer Mode** → Right-click server → **Copy Server ID** |

> **Never commit `.env` to Git.** If the token leaks, reset it immediately in the Developer Portal.

---

## Create & invite the bot

1. Go to https://discord.com/developers/applications  
2. Create a new application (e.g., “Standup Bot”)  
3. Add a **Bot**  
4. Copy the **Bot Token** and set `DISCORD_TOKEN` in `.env`  
5. Invite the bot to your server by opening this URL (replace `CLIENT_ID` with your Application ID):

```
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot%20applications.commands&permissions=2048
```

- `applications.commands` enables slash commands
- `permissions=2048` grants **Send Messages** (you can adjust later)

After inviting, confirm the bot appears in **Server Settings → Members**.

---

## Install

### Requirements
- Node.js **18+** (Node 20 LTS recommended)
- npm

### Install dependencies
```bash
npm install
```

---

## Register the slash command

Run this once during setup (and again whenever you change command options):

```bash
node register-commands.js
```

Guild commands register quickly for the server specified by `GUILD_ID`.

---

## Run the bot (local)

```bash
node index.js
```

Expected log:
```
✅ Logged in as Standup Bot#XXXX
```

---

## Run on a server via SSH (recommended)

### Option A: PM2 (easiest)

1) SSH into your server:
```bash
ssh youruser@your-server-ip
```

2) Install Node.js (Ubuntu/Debian example for Node 20):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs
```

3) Copy the project to the server (choose one):

**Clone from git**
```bash
git clone <YOUR_REPO_URL> discord-standup-bot
cd discord-standup-bot
```

**Or upload from your local machine**
```bash
# run this on your LOCAL machine
scp -r ./discord-standup-bot youruser@your-server-ip:~/
```

4) Create `.env` on the server:
```bash
cd ~/discord-standup-bot
nano .env
```

5) Install deps and register commands:
```bash
npm install
node register-commands.js
```

6) Start with PM2:
```bash
sudo npm i -g pm2
pm2 start index.js --name discord-standup-bot
pm2 save
pm2 startup
```

Logs:
```bash
pm2 logs discord-standup-bot
```

---

### Option B: systemd (advanced)

1) Move project to a stable path (example):
```bash
sudo mkdir -p /opt/discord-standup-bot
sudo chown -R $USER:$USER /opt/discord-standup-bot
cp -r ~/discord-standup-bot/* /opt/discord-standup-bot/
cd /opt/discord-standup-bot
npm install
node register-commands.js
```

2) Create the service:
```bash
sudo nano /etc/systemd/system/discord-standup-bot.service
```

Paste (change `User=` and paths if needed):
```ini
[Unit]
Description=Discord Standup Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/opt/discord-standup-bot
EnvironmentFile=/opt/discord-standup-bot/.env
ExecStart=/usr/bin/node /opt/discord-standup-bot/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

3) Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable discord-standup-bot
sudo systemctl start discord-standup-bot
sudo systemctl status discord-standup-bot
```

Logs:
```bash
sudo journalctl -u discord-standup-bot -f
```

---

## Using `/standup`

Minimal:
```
/standup today:"Implement checkout flow"
```

Full:
```
/standup today:"Write invoice tests" yesterday:"Refactored OrderService" blockers:"Waiting for staging access"
```

### Command behavior

| Field | Required | Default |
|---|---:|---|
| Today | ✅ | — |
| Yesterday | ❌ | None |
| Blockers | ❌ | None |

---

## Maintenance

### Update code (git)
```bash
git pull
npm install
pm2 restart discord-standup-bot
```

### If you change slash command options
```bash
node register-commands.js
```

---

## Security notes

- Keep `DISCORD_TOKEN` secret
- Never commit `.env`
- If token leaks, reset it in the Developer Portal immediately
- Run only one instance of the bot to avoid confusion

---

## License

MIT (or your preferred license)
