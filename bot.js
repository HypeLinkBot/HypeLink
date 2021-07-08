const Discord = require('discord.js');
const consola = require('consola');
const grab = require('node-fetch');
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
    threshold: 0.2,
    minMatchCharLength: 3
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
    }).catch();
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
    const errorChannel = client.channels.cache.get(config.error_channel);

    if (!errorChannel) return;
    errorChannel.send(
        new Discord.MessageEmbed()
            .setTitle(':sob: Promise Rejection')
            .setColor(e.red)
            .addField('Output', `\`\`\`\n${reason}\n\`\`\``, false)
            .addField('Guild', `${lastRanCommand.guildname} (${lastRanCommand.guild})`, true)
            .addField('Channel', `${lastRanCommand.channel}`, true)
            .addField('Author', `${lastRanCommand.tag} (${lastRanCommand.author})`, true)
            .addField('Command', lastRanCommand.pretty, false)
            .setTimestamp()
    ).catch();
});

let lastRanCommand = {
    guild: null,
    guildname: null,
    channel: null,
    author: null,
    tag: null,
    messageid: null,
    prefix: null,
    command: null,
    args: null,
    pretty: null
};
let channelCooldowns = {};
client
    // .on('debug', consola.log)
    .on('error', consola.error)
    .on('warn', consola.warn)
    .on('ready', async () => {
        consola.success(`Logged in as ${client.user.tag} (${client.user.id})`);

        getNextStatus();
        setInterval(getNextStatus, 5000);

        setInterval(() => {
            channelCooldowns = {};
        }, 10000)

        await updateSkyblockZScammerlist();
        backupDatabase();
    })
    .on('disconnect', () => { console.warn('Disconnected'); })
    .on('reconnecting', () => { console.warn('Reconnecting'); })
    .on('guildCreate', guild => {
        consola.info(`😳 Added to ${guild.name} (${guild.id})`);
    })
    .on('guildDelete', guild => {
        if (guild.name === undefined) return;
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

        if (!client.commands.has(command)) {
            let startingCommand = command;
            client.commands.forEach(cmd => {
                if (cmd.alias.indexOf(command) !== -1) {
                    return command = cmd.name;
                }
            })

            if (command === startingCommand) {
                const fuseResult = fuse.search(command);

                if (fuseResult.length < 1) return;
                command = fuseResult[0].item;
            }
        }

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

        const currChannelCooldown = channelCooldowns[message.channel.id]
        if (currChannelCooldown !== undefined) {
            if (currChannelCooldown > 2) return;
            channelCooldowns[message.channel.id] += 1;
        } else channelCooldowns[message.channel.id] = 0;

        try {
            const selectedCommand = client.commands.get(command);
            let guildOnly = selectedCommand.guild;

            lastRanCommand = {
                guild: message.guild ? message.guild.id : 'No ID',
                guildname: message.guild ? message.guild.name : 'DMs',
                channel: message.channel.id,
                author: message.author.id,
                tag: message.author.tag,
                messageid: message.id,
                prefix,
                command,
                args,
                pretty: `${prefix}${command} ${args.join(' ')}`
            }

            consola.log(`${lastRanCommand.guildname} | ${lastRanCommand.tag} | ${lastRanCommand.pretty}`);

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

const backupDatabase = () => {
    fs.copyFile(
        'json.sqlite',
        `backups/${Date.now()}.sqlite`,
        fs.constants.COPYFILE_EXCL,
        (err) => {
            if (err) throw err;
            consola.success('Backed up database');
        }
    )
}

const updateSkyblockZScammerlist = async () => {
    let res = await grab('https://raw.githubusercontent.com/skyblockz/pricecheckbot/master/scammer.json');
    res = await res.json();

    fs.writeFileSync('scammerlist.json', JSON.stringify(res));

    consola.success('Updated scammerlist.json');
}

setInterval(backupDatabase, 12 * 60 * 60 * 1000); // 12 hours
setInterval(updateSkyblockZScammerlist, 2 * 60 * 60 * 1000) // 2 hours

client.login(config.bot_token).catch();