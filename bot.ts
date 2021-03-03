const Discord = require('discord.js');
const consola = require('consola');
const fs = require('fs');

const db = require('quick.db');
if (!db.get('verified')) db.set('verified', 0)
if (!db.get('unverified')) db.set('unverified', 0)

const config = require('./config.json');
const e = require('./embeds.json');
const owner = require('./owner.json');

let commandList = [];

const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commandList.push(command.name);
    client.commands.set(command.name, command);
}

const Fuse = require('fuse.js');
const fuse = new Fuse(commandList, {
    includeScore: true,
    threshold: 0.3,
    minMatchCharLength: 2
});

const getUserCount = () => {
    let memberCount = 0;
    client.guilds.cache.forEach(g => {
        memberCount += g.memberCount;
    })
    return memberCount;
}

const setStatus = (text) => {
    client.user.setActivity({
        name: "https://bonk.ml/ | " + text,
        type: 'PLAYING'
    });
}

let currentStatus = 0;
const getNextStatus = () => {
    let statusList = [
        client.guilds.cache.size.toLocaleString() + " servers 😳",
        db.get('verified').toLocaleString() + " verified ✅",
        getUserCount().toLocaleString() + " users 🤼"
    ]
    setStatus(statusList[currentStatus]);

    currentStatus++;
    if (currentStatus >= statusList.length) currentStatus = 0;
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

client
    // .on('debug', consola.log)
    .on('error', consola.error)
    .on('warn', consola.warn)
    .on('ready', () => {
        consola.success(`Logged in as ${client.user.tag} (${client.user.id})`);

        getNextStatus();
        setInterval(getNextStatus, 5000);
    })
    .on('disconnect', () => { console.warn('Disconnected'); })
    .on('reconnecting', () => { console.warn('Reconnecting'); })
    .on('guildCreate', guild => {
        consola.info(`😳 Added to ${guild.name} (${guild.id})`);
    })
    .on('guildDelete', guild => {
        if (guild.deleted) return;
        consola.info(`😭 Removed from ${guild.name} (${guild.id})`);
    })
    .on('message', async message => {
        if (message.author.bot) return;

        let customPrefix = config.default_prefix;
        if (message.guild) customPrefix = db.get(`${message.guild.id}.prefix`);
        const prefix = customPrefix || config.default_prefix;

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
            let channelPermissions = message.channel.permissionsFor(client.user);
            let rolePermissions = message.guild.members.cache
                .get(client.user.id).hasPermission('MANAGE_ROLES');

            if (!channelPermissions.has('SEND_MESSAGES')) return;
            if (
                !channelPermissions.has('EMBED_LINKS') ||
                !channelPermissions.has('USE_EXTERNAL_EMOJIS') ||
                !rolePermissions
            ) {
                let requiredPerms = [];

                if (!channelPermissions.has('EMBED_LINKS'))
                    requiredPerms.push(' • \`Embed Links\`');
                if (!channelPermissions.has('USE_EXTERNAL_EMOJIS'))
                    requiredPerms.push(' • \`Use External Emojis\`');
                if (!rolePermissions)
                    requiredPerms.push(' • \`Manage Roles\`');

                return message.channel.send(
                    `:x: **I'm missing the following permissions :sob:**:\n` +
                    `${requiredPerms.join('\n')}\n\n` +
                    `DM \`${owner.tag}\` if you think this is an error.`
                ).catch();
            }
        }

        if (!client.commands.has(command)) {
            let startingCommand = command;
            client.commands.forEach(cmd => {
                if (cmd.alias.indexOf(command) !== -1) {
                    return command = cmd.name;
                }
            })

            if (command == startingCommand) {
                const fuseResult = fuse.search(command);

                if (fuseResult.length < 1) return;
                command = fuseResult[0].item;
            }
        }

        try {
            const selectedCommand = client.commands.get(command);
            let guildOnly = selectedCommand.guild;

            if (guildOnly && !message.guild) {
                return message.channel.send(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(`${e.x} **This command can only be ran in servers.**`)
                ).catch();
            }

            selectedCommand.execute(message, args, client, prefix);
        } catch (err) {
            consola.error(err);

            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **An error occurred while running that command :sob:**\n` +
                        `DM \`${owner.tag}\` and they can help you.`
                    )
            ).catch();
        }
    })

client.login(config.bot_token);