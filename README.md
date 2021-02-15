# HypeLink
Hypixel and Discord verification bot. (basically HyVerify 2)
---
I started working on bots again and decided to remake HyVerify since it was a mess 😳

### Invite the bot to your own server by [clicking here](https://bonk.ml/invite)

### How to run the bot locally:

- Install nodejs from [here](https://nodejs.org/en/)
- Clone this repo (`git clone https://github.com/foobball/HypeLink.git`)
- Download the dependencies with `npm install`
- Create `config.json` and use the format below:
```json
{
  "hypixel_key": "your hypixel api key (do '/api new' in-game)",
  "bot_token": "the discord bot token",
  
  "report_channel": "channel id of where reports should be sent",
  "suggest_channel": "channel id of where suggestions should be sent",
  
  "invite_link": "the full bot invite link (e.g. https://discord.com/api/oauth2/authorize?client_id=478330652119400451&permissions=8&redirect_uri=https://bonk.ml/redir&response_type=code&scope=bot%20identify&response_type=code)",
  "default_prefix": "!",
  "name": "HypeLink",
  "owner": "your discord id"
}
```
- Use `node app.js` to start the bot

Refer to the bot's [Hypixel thread](https://hypixel.net/threads/hypelink-hypixel-and-discord-verification-bot.3843125/) for the list of commands.
