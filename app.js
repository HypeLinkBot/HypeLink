const Discord = require('discord.js');
const fs = require('fs');
const stats = require('./lib/getStats');
const db = require('quick.db');
const config = require('./config.json');
const consola = require('consola');
const ranks = require('./ranks.json');
const e = require('./embeds.json');
const owner = require('./lib/owner');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

if (!db.get('verified')) db.set('verified', 0);
if (!db.get('unverified')) db.set('unverified', 0);

db.set('startup', new Date().getTime());

let currStatus = 0;

function updateStatus() {
    let statusList = [
        client.guilds.cache.size.toLocaleString() + " servers 😳",
        db.get('verified') + " verified ✅",
        client.users.cache.size.toLocaleString() + " users 🤼"
    ]
    setStatus(statusList[currStatus]);
    currStatus++;

    if (currStatus >= statusList.length) currStatus = 0;
}

function setStatus(text, type = "PLAYING") {
    client.user.setActivity({
        name: "www.bonk.ml | " + text,
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

client.on('guildDelete', (guild) => {
    consola.info(`😭 Removed from ${guild.name} (${guild.id})`)
})

client.on('message', async message => {
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

            if (command == 'help') {
                let helplist = ``;
                client.commands.forEach((cmd) => {
                    if (cmd.name !== 'eval' && cmd.name !== 'db')
                        helplist += `\`${prefix}${cmd.name}\` - ${cmd.description}\n`;
                })

                helplist += `\n<:logo:791084884398702632> Thread: https://hypixel.net/threads/hypelink-hypixel-and-discord-verification-bot.3843125/\n<:hypelink:806564809386623097> Website: https://bonk.ml/`

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
                        newmsg.delete({ timeout: 4000 });
                    });
                });
                return;
            }

            if (!client.commands.has(command)) {
                let prev = command;

                client.commands.forEach((cmd) => {
                    if (cmd.alias.indexOf(command) !== -1) {
                        command = cmd.name;
                        return;
                    }
                })

                if (command == prev) return;
            }

            try {
                console.log(`"${message.author.tag}" ran "!${command} ${args}" in ${(message.guild) ? `"${message.guild.name}" (${message.guild.id})` : 'DMs'}`);

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