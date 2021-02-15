const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
const get = require('../lib/getStats');
const config = require('../config.json');
const ranks = require('../ranks.json')

module.exports = {
    name: 'whitelist',
    description: 'Set verification channel',
    cat: 'settings',
    alias: ['wl'],
    guild: true,
    async execute(message, args, client, prefix) {
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(
                    `${e.x} **You don't have permission to use this command**\n` +
                    `${e.bunk} You need the **Administrator** permission to use this command.`
                )

            return message.channel.send(embed).then((newmsg) => {
                newmsg.delete({ timeout: 7000 }).catch();
            });
        }

        if (args.length !== 0) {
            if (args[0].toLowerCase() == 'reset') {
                db.set(`${message.guild.id}.whitelisted`, null);
                const embed = new Discord.MessageEmbed()
                    .setColor(e.green)
                    .setDescription(
                        `${e.check} **Verification channel whitelist removed.**\n` +
                        `${e.bunk} *(you can now use \`${prefix}verify\` in any channel)*`
                    )

                return message.channel.send(embed)
            }
        }

        if (db.get(`${message.guild.id}.whitelisted`) == message.channel.id) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(
                    `${e.x} **This channel is already set as the verification channel.**`
                )

            return message.channel.send(embed)
        }

        db.set(`${message.guild.id}.whitelisted`, message.channel.id);
        const embed = new Discord.MessageEmbed()
            .setColor(e.green)
            .setDescription(
                `${e.check} **<#${message.channel.id}> is now set as the verification channel.**\n` +
                `${e.bunk} *(you can remove the whitelist by doing \`${prefix}whitelist reset\`)*`
            )

        return message.channel.send(embed)
    },
};