const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
const get = require('../lib/getStats');

module.exports = {
    name: 'unverify',
    description: 'Unverify yourself',
    cat: 'settings',
    alias: ['unv'],
    guild: true,
    async execute(message, args, client, prefix) {
        let roleid = db.get(`${message.guild.id}.roles.verified`);
        let role = message.guild.roles.cache.get(roleid);

        if (db.get(`${message.guild.id}.allow_unverify`) == false) {
            let desc = `${e.x} **You can\'t unverify in this server**`;

            if (message.member.hasPermission('ADMINISTRATOR')) {
                desc += `\n${e.bunk} *(To change this setting, run \`${prefix}settings AllowUnverify on\`)*`
            }

            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(desc)
            return message.channel.send(embed).then((newmsg) => {
                if (!message.member.hasPermission('ADMINISTRATOR')) {
                    newmsg.delete({ timeout: 6000 }).catch();
                }
            });
        }

        if (role == undefined || role == null) {
            let msg = `${e.x} **This server doesn\'t have a configured \`Verified\` role.**`
            if (message.member.hasPermission('ADMINISTRATOR')) {
                msg += `\n${e.bunk} Use \`${prefix}setrole Verifed [role id]\` to set a preexisting verified role,\n ${e.bunk} or use \`${prefix}createroles\` to automatically create missing roles.`;
            }

            const embed = new Discord.MessageEmbed()
                .setColor(ee.red)
                .setDescription(msg);

            return message.channel.send(embed);
        }

        if (!message.member.roles.cache.has(roleid)) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(`${e.x} You\'re already unverified!\n${e.bunk} Use \`${prefix}verify [username]\` to verify yourself.`);
            return message.channel.send(embed);
        }

        let newmsg = await message.channel.send(new Discord.MessageEmbed()
            .setColor('GRAY')
            .setDescription(`${e.loading} Unverifying you...`));

        const serverroles = db.get(`${message.guild.id}.roles`);
        let ids = Object.keys(serverroles);

        for (let i = 0; i < ids.length; i++) {
            ids[i] = serverroles[ids[i]];
        }

        let encerr = false;
        await message.member.roles.cache.forEach((userrole) => {
            if (ids.indexOf(userrole.id) !== -1) {
                message.member.roles.remove(userrole.id).catch(() => {
                    encerr = true;
                    let errembed = new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(`${e.x} **Couldn't remove roles from you!**\n\n${e.bunk} Make sure the bot's role is higher\n${e.bunk} than the ones it's trying to remove`)
                    return newmsg.edit(errembed).catch();
                });
            }
        })

        setTimeout(() => {
            if (encerr) return;
            newmsg.edit(new Discord.MessageEmbed()
                .setColor(e.green)
                .setDescription(e.check + ` You were successfully unverified!`)).then(() => {

                db.set('unverified', db.get('unverified') + 1);

                if (db.get(`${message.guild.id}.dm_unverify`) == true) {
                    message.author.send(
                        new Discord.MessageEmbed()
                        .setColor(e.green)
                        .setDescription(e.check + ` You were successfully unverified in **${message.guild.name}**`)).catch()
                }
            });
        }, 600)
    },
};