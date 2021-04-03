const db = require('quick.db');
const Discord = require('discord.js');
const e = require('../embeds.json');

module.exports = {
    name: 'whitelist',
    description: 'Set verification channel',
    cat: 'settings',
    alias: ['wl'],
    guild: true,
    async execute(message, args, client, prefix) {
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **You don't have permission to use this command**\n` +
                        `You need the **Administrator** permission to use this command.`
                    ))
                .then(newMessage => {
                    newMessage.delete({ timeout: 7000 }).catch();
                }).catch();
        }

        if (args.length !== 0) {
            if (args[0].toLowerCase() === 'reset') {
                db.set(`${message.guild.id}.whitelisted`, null);

                return message.channel.send(
                    new Discord.MessageEmbed()
                    .setColor(e.green)
                    .setDescription(
                        `${e.check} **Verification channel whitelist removed.**\n` +
                        `*(you can now use \`${prefix}verify\` in any channel)*`
                    )
                ).catch();
            }
        }

        if (db.get(`${message.guild.id}.whitelisted`) === message.channel.id) {
            return message.channel.send(
                new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(
                    `${e.x} **This channel is already set as the verification channel.**`
                )
            ).catch();
        }

        db.set(`${message.guild.id}.whitelisted`, message.channel.id);

        return message.channel.send(
            new Discord.MessageEmbed()
            .setColor(e.green)
            .setDescription(
                `${e.check} **<#${message.channel.id}> is now set as the verification channel.**\n` +
                `*(you can remove the whitelist by doing \`${prefix}whitelist reset\`)*`
            )
        ).catch();
    },
};