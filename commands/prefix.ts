const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');

module.exports = {
    name: 'prefix',
    description: 'View and change the bot\'s prefix',
    cat: 'settings',
    alias: ['pre', 'setprefix'],
    guild: true,
    execute(message, args, client, prefix) {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} You need to **Manage Server** permission to use this command.`
                    )
            ).then(newMessage => {
                newMessage.delete({
                    timeout: 7000
                }).catch();
            }).catch();
        }

        if (args.length == 0) {
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.default)
                    .setDescription(
                        `The current prefix for this server is \`${prefix}\`.\n` +
                        `Change it by sending \`${prefix}prefix [new prefix]\`\n\n` +
                        `You can also mention the bot instead of using the prefix`
                    )
            ).catch();
        }

        const newPrefix = args[0].substr(0, 10);
        db.set(`${message.guild.id}.prefix`, newPrefix)

        consola.info(`Prefix for ${message.guild.name} changed to ${newPrefix}`);

        return message.channel.send(
            new Discord.MessageEmbed()
                .setColor(e.green)
                .setDescription(`${e.check} Prefix changed to \`${newPrefix}\``)
        ).catch();
    },
};