const Discord = require('discord.js');
const fs = require('fs');
const Fuse = require('fuse.js');
const stats = require('./lib/getStats');
const db = require('quick.db');
const config = require('./config.json');
const consola = require('consola');
const ranks = require('./ranks.json');
const e = require('./embeds.json');
const owner = require('./lib/owner');

let commandlist = ['help'];

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    commandlist.push(command.name);

    client.commands.set(command.name, command);
}

const getUserCount = () => {
    let memberCount = 0;
    client.guilds.cache.forEach(g => {
        memberCount += g.memberCount;
    })
    return memberCount;
}

const fuse = new Fuse(commandlist, {
    includeScore: true,
    threshold: 0.26,
    minMatchCharLength: 2
});

if (!db.get('verified')) db.set('verified', 0);
if (!db.get('unverified')) db.set('unverified', 0);

db.set('startup', new Date().getTime());

let currStatus = 0;

function updateStatus() {
    let statusList = [
        client.guilds.cache.size.toLocaleString() + " servers 😳",
        db.get('verified').toLocaleString() + " verified ✅",
        getUserCount().toLocaleString() + " users 🤼"
    ]
    setStatus(statusList[currStatus]);
    currStatus++;

    if (currStatus >= statusList.length) currStatus = 0;
}

function setStatus(text, type = "PLAYING") {
    client.user.setActivity({
        name: "https://bonk.ml/ | " + text,
        type
    })
}

client.once('ready', () => {
    let wlcstr = `Logged in as ${client.user.tag}`;
    if (client.shard) wlcstr += ` in shard ${client.shard.ids}`;

    consola.success(wlcstr);

    updateStatus();
    setInterval(updateStatus, 5000);
})

client.on("error", (e) => {
    consola.error(e)
});

client.on("warn", (e) => {
    consola.warn(e)
});

client.on('guildCreate', (guild) => {
    consola.info(`😳 Added to ${guild.name} (${guild.id})`);
})

const helpcmd = (message, prefix) => {
    let helplist = ``;
    client.commands.forEach((cmd) => {
        if (cmd.name !== 'eval' && cmd.name !== 'db' && cmd.name !== 'keystats')
            helplist += `\`${prefix}${cmd.name}\` - ${cmd.description}\n`;
    })
    helplist += `\n<:logo:791084884398702632> Thread: https://hypixel.net/threads/hypelink-hypixel-and-discord-verification-bot.3843125/\n<:hypelink:806564809386623097> Website: https://bonk.ml/\n\n**Remember to vote for HypeLink on [top.gg](https://top.gg/bot/${client.user.id}/vote) :grin:**`
    const embed = new Discord.MessageEmbed()
        .setDescription(helplist)
        .setTitle('List of Commands')
        .setThumbnail('https://hotemoji.com/images/dl/7/rolled-up-newspaper-emoji-by-twitter.png')
    message.author.send(embed).then(() => {
        if (message.guild) message.react('✅');
    }).catch(() => {
        const embed = new Discord.MessageEmbed()
            .setColor(e.red)
            .setDescription(`${e.x} **Please enable DMs from server members.**`);
        message.channel.send(embed).then((newmsg) => {
            newmsg.delete({
                timeout: 4000
            });
        });
    });
    return;
}

client.on('guildDelete', (guild) => {
    consola.info(`😭 Removed from ${guild.name} (${guild.id})`);
})

client.on('message', async(message) => {
    if (message.author.bot) return;
    let customprefix = '!';
    if (message.guild) customprefix = db.get(`${message.guild.id}.prefix`);
    const prefix = customprefix || config.default_prefix;
    let args;
    if (message.content.startsWith(prefix))
        args = message.content.slice(prefix.length).trim().split(/ +/);
    else if (message.content.startsWith(`<@!${client.user.id}>`))
        args = message.content.slice(`<@!${client.user.id}>`.length).trim().split(/ +/);
    else if (message.content.startsWith(`<@${client.user.id}>`)) {
        args = message.content.slice(`<@${client.user.id}>`.length).trim().split(/ +/);
    } else return;

    let command = args.shift().toLowerCase();

    if (message.guild) {
        let cig = message.guild.members.cache.get(client.user.id)
        if (!cig.hasPermission('EMBED_LINKS') ||
            !cig.hasPermission('USE_EXTERNAL_EMOJIS') ||
            !cig.hasPermission('MANAGE_ROLES')
        ) {
            let reqperms = [];

            if (!cig.hasPermission('EMBED_LINKS')) reqperms.push(' • \`Embed Links\`');
            if (!cig.hasPermission('USE_EXTERNAL_EMOJIS')) reqperms.push(' • \`Use External Emojis\`');
            if (!cig.hasPermission('MANAGE_ROLES')) reqperms.push(' • \`Manage Roles\`');

            return message.channel.send(`:x: **I'm missing the following permissions:**\n${reqperms.join('\n')}`).catch();
        }
    }

    if (command == 'help') {
        return helpcmd(message, prefix);
    }
    if (!client.commands.has(command)) {
        let prev = command;
        client.commands.forEach((cmd) => {
            if (cmd.alias.indexOf(command) !== -1) {
                command = cmd.name;
                return;
            }
        })
        if (command == prev) {
            const result = fuse.search(command);

            if (result.length < 1) return;
            command = result[0].item;
            if (command == 'help') return helpcmd(message, prefix);
        }
    }
    try {
        let guildonly = client.commands.get(command).guild;
        if (guildonly && !message.guild) {
            return message.channel.send(`${e.x} This command can only be ran in guilds.`).catch();
        }

        client.commands.get(command).execute(message, args, client, prefix);
    } catch (error) {
        consola.error(error);

        message.channel.send(
            new Discord.MessageEmbed()
            .setColor(e.red)
            .setDescription(`${e.x} There was an error trying to execute that command.\n${e.bunk} DM \`${owner(client).tag}\` and she can help you :pleading_face:`)
        );
    }
});

client.login(config.bot_token);