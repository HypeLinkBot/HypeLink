const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
const ranks = require('../ranks.json');

module.exports = {
    name: 'createroles',
    description: 'Creates default rank roles',
    cat: 'settings',
    alias: ['roles', 'role'],
    async execute(message, args, client, prefix) {
        if (!message.member.hasPermission('MANAGE_ROLES')) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(`${e.x} You need the **Manage Roles** permission to use this command`)
            return message.channel.send(embed).then((newmsg) => {
                newmsg.delete({ timeout: 5000 })
            });
        }

        let waitembed = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(`${e.loading} **Please wait...**\n${e.bunk} Creating missing roles`)

        let newmsg = await message.channel.send(waitembed);
        let tocreate = ["verified", "VIP", "VIP_PLUS", "MVP", "MVP_PLUS", "SUPERSTAR"];

        //if (args.length >= 1) {
        //    if (args[0] == 'all' || args[0] == 'a') {
        tocreate.push('HELPER');
        tocreate.push('YOUTUBER');
        tocreate.push('MODERATOR');
        tocreate.push('ADMIN');
        //    }
        //}

        tocreate.reverse();
        let newroles = [];

        for (let i = 0; i < tocreate.length; i++) {
            let rankname = tocreate[i];
            let rank = ranks[rankname];
            //consola.info('Creating ' + rank.formatted + ' role');

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
                    newroles.push(`<@&${role.id}>`);
                    db.set(`${message.guild.id}.roles.${rankname}`, role.id);
                })
                .catch(consola.error);
        }

        let desc = e.check + ' **Created the following roles**:\n' + e.bunk + ' ';

        if (newroles.length < 1) desc += 'None';
        else desc += newroles.join(', ');

        let successembed = new Discord.MessageEmbed()
            .setColor(e.green)
            .setDescription(desc)
        newmsg.edit(successembed);
    },
};