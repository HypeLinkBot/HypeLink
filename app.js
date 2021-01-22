const Discord = require('discord.js');
const fs = require('fs');
const stats = require('./lib/getStats');
const db = require('quick.db');
const config = require('./config.json');
const consola = require('consola');
const ranks = require('./ranks.json');
const e = require('./embeds.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

function updateStatus() {
    client.user.setActivity({
        name: "for commands... | www.bonk.ml | " + client.guilds.cache.size + " servers",
        type: "WATCHING"
    })
}

client.once('ready', () => {
    consola.success(`Logged in as ${client.user.tag}`);
    //client.user.setPresence('www.bonk.ml');
    updateStatus()
})

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const customprefix = db.get(`${message.guild.id}.prefix`);
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
        client.commands.get(command).execute(message, args, client, prefix);
    } catch (error) {
        consola.error(error);
        message.channel.send(
            new Discord.MessageEmbed()
            .setColor(e.red)
            .setDescription(e.x + ' There was an error trying to execute that command!')
        );
    }
});

client.login(config.bot_token);