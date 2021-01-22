const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
const ranks = require('../ranks.json');

module.exports = {
    name: 'setrole',
    description: 'Set ',
    alias: ['setroles', 'sr', 'srs'],
    cat: 'settings',
    async execute(message, args, client, prefix) {
        if (!message.member.hasPermission('MANAGE_ROLES')) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(`${e.x} You need the **Manage Roles** permission to use this command`)
            return message.channel.send(embed).then((newmsg) => {
                newmsg.delete({ timeout: 5000 })
            });
        }

        let options = ["verified", "vip", "vip+", "mvp", "mvp+", "mvp++", "youtuber", "helper", "moderator", "admin"]
        let full = ["verified", "VIP", "VIP_PLUS", "MVP", "MVP_PLUS", "SUPERSTAR", "YOUTUBER", "HELPER", "MODERATOR", "ADMIN"]

        if (args.length == 0) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.green)
                .setDescription(
                    `:flushed: Set Role as Rank\n` +
                    `${e.bunk} **Role type list**: \`Verified, VIP, VIP+, MVP, MVP+, MVP++,\`\n` +
                    `${e.bunk} ${e.bunk} ${e.bunk} ${e.bunk} ${e.bunk} \`YouTuber, Helper, Moderator, Admin\`\n\n` +
                    `*Command for setting role as rank*:\n` +
                    `${e.bunk} \`${prefix}setrole [roletype] [@mention or role id]\`\n` +
                    `${e.bunk} \`${prefix}setrole VIP 714596365774356551\``
                );

            return message.channel.send(embed);
        } else if (args.length == 2) {
            let role = message.mentions.roles.first();

            if (role !== undefined) {
                role = role.id;
            } else {
                let roleid = args[1];
                if (message.guild.roles.cache.get(roleid) == null || message.guild.roles.cache.get(roleid) == undefined) {
                    return message.channel.send(
                        new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(`${e.x} **Invalid role**\n\n${e.bunk} \`${prefix}setrole [roletype] [@mention or role id]\`\n${e.bunk} \`${prefix}setrole VIP 714596365774356551\``)
                    );
                }

                role = roleid;
            }

            if (options.indexOf(args[0].toLowerCase()) == -1) {
                return message.channel.send(
                    new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **Invalid roletype**\n` +
                        `Role types: \`${options.join(', ')}\`\n\n` +
                        `${e.bunk} \`${prefix}setrole [roletype] [@mention or role id]\`\n` +
                        `${e.bunk} \`${prefix}setrole VIP 714596365774356551\``
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