const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
const ranks = require('../ranks.json');

module.exports = {
    name: 'setrole',
    description: 'Assign a rank or "verified" to a role',
    alias: ['setroles', 'sr', 'srs'],
    cat: 'settings',
    guild: true,
    async execute(message, args, client, prefix) {
        if (!message.member.hasPermission('MANAGE_ROLES')) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(`${e.x} You need the **Manage Roles** permission to use this command`)
            return message.channel.send(embed).then((newmsg) => {
                newmsg.delete({ timeout: 5000 })
            });
        }

        const options = [
            "verified", "vip", "vip+", "mvp", "mvp+", "mvp++", "youtuber", "helper", "moderator", "admin"
        ], full = [
            "verified", "VIP", "VIP_PLUS", "MVP", "MVP_PLUS", "SUPERSTAR", "YOUTUBER", "HELPER", "MODERATOR", "ADMIN"
        ]

        if (args.length === 0) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.green)
                .setDescription(
                    `:flushed: **__Set Role as Rank__**\n` +
                    `Role type list: \`Verified, VIP, VIP+, MVP, MVP+, MVP++,\`\n` +
                    `\`YouTuber, Helper, Moderator, Admin\`\n\n` +
                    `**Command example**:\n` +
                    `\`${prefix}setrole [roletype] [@rolemention or role id]\`\n` +
                    `\`${prefix}setrole VIP 714596365774356551\``
                );

            return message.channel.send(embed);
        } else if (args.length === 2) {
            let role = message.mentions.roles.first();

            if (role !== undefined) {
                role = role.id;
            } else {
                let roleid = args[1];
                if (message.guild.roles.cache.get(roleid) == null || message.guild.roles.cache.get(roleid) === undefined) {
                    return message.channel.send(
                        new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(`${e.x} **Invalid role**\n\n\`${prefix}setrole [roletype] [@mention or role id]\`\n\`${prefix}setrole VIP 714596365774356551\``)
                    );
                }

                role = roleid;
            }

            if (options.indexOf(args[0].toLowerCase()) === -1) {
                return message.channel.send(
                    new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **Invalid roletype**\n` +
                        `**Valid role types**: \`${options.join(', ')}\`\n\n` +
                        `\`${prefix}setrole [roletype] [@mention or role id]\`\n` +
                        `\`${prefix}setrole VIP 714596365774356551\``
                    )
                )
            }

            db.set(`${message.guild.id}.roles.${full[options.indexOf(args[0].toLowerCase())]}`, role);
            return message.channel.send(
                new Discord.MessageEmbed()
                .setColor(e.green)
                .setDescription(e.check + ` Set **${options[options.indexOf(args[0].toLowerCase())].toUpperCase()}** role to <@&${role}>`)
            );
        }
    },
};