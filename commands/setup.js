const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
const get = require('../lib/getStats');
const config = require('../config.json');
const ranks = require('../ranks.json')

module.exports = {
    name: 'setup',
    description: 'Setup the bot itself',
    alias: [],
    cat: 'settings',
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

        await message.channel.send(new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(
                `:wave: **Welcome**\n` +
                `${e.bunk} Thanks for using my bot, ${config.name}!`
            ))

        let progress = await message.channel.send(new Discord.MessageEmbed()
            .setColor(e.red)
            .setDescription(
                `${e.loading} Creating missing Hypixel rank roles...`
            ))

        let tocreate = ["verified", "VIP", "VIP_PLUS", "MVP", "MVP_PLUS", "SUPERSTAR", "YOUTUBER", "HELPER", "MODERATOR", "ADMIN"];

        tocreate.reverse();

        for (let i = 0; i < tocreate.length; i++) {
            let rankname = tocreate[i];
            let rank = ranks[rankname];

            let roleid = db.get(`${message.guild.id}.roles.${rankname}`);
            if (roleid !== null && roleid !== undefined) {
                if (message.guild.roles.cache.get(roleid) !== null && message.guild.roles.cache.get(roleid) !== undefined) {
                    continue;
                }
            }

            await message.guild.roles.create({
                    data: {
                        name: rank.formatted,
                        color: rank.color,
                        permissions: [],
                    },
                    reason: `${message.author.tag}: Hypixel rank roles`
                })
                .then((role) => {
                    console.log(`${message.guild.id}.roles.${rankname}`);
                    db.set(`${message.guild.id}.roles.${rankname}`, role.id);
                })
                .catch(consola.error);


        }

        await progress.edit(new Discord.MessageEmbed()
            .setColor(e.green)
            .setDescription(
                e.check + ` Missing Hypixel rank roles created!`
            ))


        let whitelist = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(
                `⚙ **Whitelist channel for verification**\n` +
                `${e.bunk} Type \`${prefix}whitelist\` in any channel to set it as the only channel\n${e.bunk} where \`${prefix}verify\` is allowed.`
            )

        return message.channel.send(whitelist);
    },
};