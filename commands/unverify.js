const db = require('quick.db');
const Discord = require('discord.js');
const e = require('../embeds.json');

module.exports = {
    name: 'unverify',
    description: 'Unverify yourself',
    cat: 'settings',
    alias: ['unv'],
    guild: true,
    async execute(message, args, client, prefix) {
        const {
            member,
            guild,
            channel
        } = message;

        let verifiedRoleID = db.get(`${guild.id}.roles.verified`);
        let verifiedRole = guild.roles.cache.get(verifiedRoleID);
        const allowUnverify = db.get(`${guild.id}.allow_unverify`);

        if (allowUnverify === false) {
            let errorMessage = `${e.x} **You can't unverify in this server**\n`;

            if (member.hasPermission('ADMINISTRATOR'))
                errorMessage += `*(To change this setting, run \`${prefix}set AllowUnverify true\`)*`

            return channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(errorMessage)
            ).then(newMessage => {
                newMessage.delete({
                    timeout: 7000
                });
            }).catch();
        }

        if (verifiedRole == null) {
            const HyVerifyRole = guild.roles.cache.find(r => r.name === 'Hypixel Verified');
            if (HyVerifyRole !== undefined && HyVerifyRole !== null) {
                db.set(`${guild.id}.roles.verified`, HyVerifyRole.id);
                verifiedRole = HyVerifyRole;
            } else {
                let errorMessage = `${e.x} **This server doesn't have a configured \`Verified\` role.**\n`;

                if (member.hasPermission('ADMINISTRATOR'))
                    errorMessage +=
                        `Use \`${prefix}setrole verified [@rolemention]\` to set a verified role.`

                return channel.send(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(errorMessage)
                ).catch();
            }
        }

        if (!member.roles.cache.get(verifiedRoleID)) {
            return channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **You're not verified**!`)
            ).catch();
        }

        const newMessage = await channel.send(
            new Discord.MessageEmbed()
                .setColor(e.default)
                .setDescription(`${e.loading} Unverifying you...`)
        ).catch(() => {});

        const serverRoles = db.get(`${guild.id}.roles`);
        let serverIDs = Object.keys(serverRoles);

        for (let i = 0; i < serverIDs.length; i++) {
            serverIDs[i] = serverRoles[serverIDs[i]];
        }

        let encError = false;

        member.roles.cache.forEach(userRole => {
            if (serverIDs.indexOf(userRole.id) !== -1) {
                message.member.roles.remove(userRole.id).catch(() => {
                    encError = true;
                    return newMessage.edit(
                        new Discord.MessageEmbed()
                            .setColor(e.red)
                            .setDescription(
                                `${e.x} **Couldn't remove roles from you!**\n\n` +
                                `Make sure the bot's role is higher\n` +
                                `than the ones it's trying to remove`
                            )
                    ).catch();
                });
            }
        })

        if (encError) return;
        newMessage.edit(
            new Discord.MessageEmbed()
                .setColor(e.green)
                .setDescription(e.check + ` You were successfully unverified!`)
        ).then(() => {
            db.add('unverified', 1);

            if (db.get(`${message.guild.id}.dm_unverify`) === true) {
                message.author.send(
                    new Discord.MessageEmbed()
                        .setColor(e.green)
                        .setDescription(e.check + ` You were successfully unverified in **${message.guild.name}**`)
                ).catch();
            }
        }).catch();
    },
};