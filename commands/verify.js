const db = require('quick.db');
const Discord = require('discord.js');
const e = require('../embeds.json');
const consola = require('consola');
const owner = require('../owner.json');
const customTags = require('../customtags.json');
const getUser = require('../lib/getStats.js').getUser;

module.exports = {
    name: 'verify',
    description: 'Verify with Hypixel',
    cat: 'settings',
    alias: ['v', 'ver', 'guide'],
    guild: true,
    async execute(message, args, client, prefix) {
        /**
         * CONSTANTS
         */
        const {
            guild,
            channel,
            member
        } = message;

        const settings = {
            ver_messages: db.get(`${guild.id}.ver_messages`) || false,
            whitelist: db.get(`${guild.id}.whitelisted`),
            guild_name: db.get(`${guild.id}.guild_name`),
            guild_match: db.get(`${guild.id}.guild_match`) || false,
            sbz_scammers: db.get(`${guild.id}.sbz_scammers`),
            change_nick: db.get(`${guild.id}.change_nick`) || true,
            rank_role: db.get(`${guild.id}.rank_role`) || true,
            verify_links: db.get(`${guild.id}.verify_links`) || true,
            remove_verify: db.get(`${guild.id}.remove_verify`) || false,
            dm_verify: db.get(`${guild.id}.dm_verify`) || false
        }

        /**
         * DISALLOW COMMANDS IF THERE'S A WHITELISTED CHANNEL
         */
        if (settings.whitelist) {
            if (settings.whitelist !== channel.id) {
                let errorDM = `${e.x} You can't verify in <#${channel.id}>\n`;

                if (member.hasPermission('ADMINISTRATOR')) {
                    errorDM +=
                        `*Because you have administrator, you can change*\n` +
                        `*this by sending \`${prefix}whitelist\` in <#${channel.id}> or*\n` +
                        `*sending \`${prefix}whitelist reset\` to remove it.*`;
                }

                message.author.send(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(errorDM)
                ).catch();

                return message.delete().catch();
            }
        }

        let verificationRoleID = db.get(`${guild.id}.roles.verified`);
        let verificationRole = guild.roles.cache.get(verificationRoleID);

        // return message.channel.send(`:x: **Hypixel's API is currently offline**.\nView Hypixel's status here: https://status.hypixel.net/`);

        /**
         * VALID USERNAME CHECK
         */
        let sampleTag = message.author.tag;
        let validChatChars = 'qwertyuiopasdfghjklzxcvbnm1234567890-_ :/\\.+=[]{}\'"\`~'.split('');
        for (let charIndex in message.author.username) {
            let char = message.author
                .username[charIndex].toLowerCase();

            if (validChatChars.indexOf(char) === -1) sampleTag =
                `${message.author.id}#${message.author.discriminator}`
        }

        /**
         * VERIFICATION INSTRUCTIONS
         */
        if (args.join('').length < 2) {
            return channel.send(
                new Discord.MessageEmbed()
                    .setTitle(':white_check_mark: Verification Instructions')
                    .setDescription(
                        `_ _• Log on to <:logo:791084884398702632> \`mc.hypixel.net\`\n` +
                        ` • Right-click your head in the main lobby\n` +
                        ` • Left-click \`Social Media\`\n` +
                        ` • Left-click <:DISCORD:815301286874185759> \`Discord\`\n` +
                        ` • Type \`${sampleTag}\` in chat\n` +
                        ` • Send \`${prefix}verify Your IGN\` here\n\n` +
                        `📹 **Video Guide:** [youtu.be/355yO2lVOXg](https://youtu.be/355yO2lVOXg)`
                    )
                    .setColor(e.default)
                    .setFooter(`Bot by ${owner.tag} | https://bonk.ml/`, owner.avatarURL)
            ).then(newMessage => {
                if (settings.ver_messages)
                    newMessage.delete({
                        timeout: 6000
                    }).catch(() => {})
            }).catch()
        }

        /**
         * HYVERIFY ROLE SUPPORT
         */
        if (!verificationRole) {
            const HyVerifyRole = guild.roles.cache.find(r => r.name === 'Hypixel Verified');
            if (!HyVerifyRole) {
                let errorMessage =
                    `${e.x} **This server doesn't have a configured \`Verified\` role.**\n`;

                if (member.hasPermission('ADMINISTRATOR')) {
                    errorMessage +=
                        `Use \`${prefix}setrole verified [@rolemention | role id]\` to set a \`Verified\` role,\n` +
                        `or use \`${prefix}createroles\` to automatically create missing roles.`;
                }

                return channel.send(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(errorMessage)
                ).catch();
            }

            db.set(`${guild.id}.roles.verified`, HyVerifyRole.id);
            verificationRoleID = HyVerifyRole.id;
            verificationRole = HyVerifyRole;
        }

        /**
         * USER IS ALREADY VERIFIED
         */
        if (member.roles.cache.has(verificationRoleID)) {
            return channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **You're already verified**!`
                    )
            ).then(newMessage => {
                if (settings.ver_messages)
                    newMessage.delete({
                        timeout: 6000
                    }).catch(() => {});
            }).catch()
        }

        const loadingMessage = await channel.send(
            new Discord.MessageEmbed()
                .setColor(e.default)
                .setDescription(
                    `${e.loading} Please wait...\n` +
                    `Contacting ${e.logo}Hypixel's API`
                )
        ).catch(() => {});

        /**
         * PREVENTS DUMMYS FROM DOING [username]
         * why are people so stupid
         */
        const username = args.join('')
            .replace(/\\/g, '')
            .replace(/\[/g, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .replace(/\\]/g, '');
        const info = await getUser(username, settings.guild_name);

        // Deletes orginial verification message
        if (settings.ver_messages) message.delete().catch(() => {});

        if (info.error)
            return loadingMessage.edit(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **${info.errorMsg} :sob:**\n` +
                        `Make sure your username is correct and wait a few minutes!`
                    )
                    .setFooter(`Bot by ${owner.tag} | https://bonk.ml/`, owner.avatarURL)
            ).then(newMessage => {
                if (settings.ver_messages)
                    newMessage.delete({
                        timeout: 5000
                    }).catch(() => {});
            }).catch();

        const validTags = [
            // foob#9889
            message.author.tag,

            // 219541416760705024#9889
            `${message.author.id}#${message.author.discriminator}`
        ]

        if (
            validTags.indexOf(info.discord) === -1
        ) {
            return loadingMessage.edit(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **Tag Mismatch :sob:**\n` +
                        `\`${info.name}\`'s set Discord (\`${info.discord}\`)\n` +
                        `doesn't match your tag (\`${sampleTag}\`)\n\n` +
                        `👉 **For linking instructions, send \`${prefix}guide\`** 👈`
                    )
            ).then(newMessage => {
                if (settings.ver_messages)
                    newMessage.delete({
                        timeout: 6000
                    }).catch(() => {});
            }).catch();
        }

        /**
         * CHECK IF USER IS A SCAMMER IN SKYBLOCKZ
         */
        if (settings.sbz_scammers === false) {
            const isScammer = require('../scammerlist.json')[info.uuid];
            if (isScammer) {
                let errorMessage = `${e.x} **You're banned from SkyblockZ**\n` +
                    `Known SkyblockZ scammers can't verify in this server.`;

                if (member.hasPermission('MANAGE_GUILD'))
                    errorMessage +=
                        `\n\n` +
                        `*Since you have \`Manage Guild\` permissions, send*\n` +
                        `*\`${prefix}set AllowSBZScammers true\` to disable this*`

                return loadingMessage.edit(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(
                            errorMessage
                        )
                ).then(newMessage => {
                    if (settings.ver_messages)
                        newMessage.delete({
                            timeout: 6000
                        }).catch(() => {});
                }).catch();
            }
        }

        if (settings.guild_match) {
            let guildMatches = true;
            if (settings.guild_name) {
                if (info.guild) {
                    if (info.guild.name.toLowerCase() !== settings.guild_name.toLowerCase())
                        guildMatches = false;
                } else guildMatches = false;
            }

            if (!guildMatches) {
                let errorMessage = `${e.x} **Guild Mismatch :sob:**\n` +
                    `You must be in the Hypixel guild \`${settings.guild_name}\` to verify in this server.`;

                if (member.hasPermission('MANAGE_GUILD'))
                    errorMessage +=
                        `\n\n` +
                        `*Since you have \`Manage Guild\` permissions, send*\n` +
                        `*\`${prefix}set GuildMatch false\` to disable this*`

                return loadingMessage.edit(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(
                            errorMessage
                        )
                ).catch();
            }
        }

        let successfullyVerified = true;
        await member.roles.add(verificationRole)
            .catch(() => {
                successfullyVerified = false;
                loadingMessage.edit(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(
                            `${e.x} **Couldn't give you the verified role :sob:**\n` +
                            `Make sure the role isn't above me`
                        )
                ).catch(() => {});
            })
        if (!successfullyVerified) return;

        if (settings.change_nick)
            member.setNickname(
                info.name,
                info.uuid
            ).catch(() => {})

        if (settings.rank_role) {
            if (info.rank) {
                const rankRoleID = db.get(`${guild.id}.roles.${info.rank}`);
                const rankRole = guild.roles.cache.get(rankRoleID);

                if (rankRole) {
                    await member.roles.add(rankRoleID).catch(() => {
                        successfullyVerified = false;
                        return loadingMessage.edit(
                            new Discord.MessageEmbed()
                                .setColor(e.red)
                                .setDescription(
                                    `${e.x} **Couldn't give you the ${info.rank.replace(/_PLUS/g, '+')} role :sob:**\n` +
                                    `Make sure the <@&${rankRoleID}> role isn't above me.`
                                )
                        ).catch(() => {});
                    })
                }
            }
        }
        if (!successfullyVerified) return;

        let customEmoji = '';
        if (customTags[info.uuid])
            customEmoji = ` ${customTags[info.uuid].emoji}`

        let successMsg =
            `${e.check} **You're all set**!\n` +
            `<@!${message.author.id}> verified as ${customEmoji}\`${info.name.replace(/_/g, '\\_')}\``

        if (info.guild)
            successMsg += `\nfrom guild \`${info.guild.name}\``

        if (settings.verify_links)
            successMsg +=
                `\n\n<:namemc:810626872990892083> [NameMC Profile](https://namemc.com/${info.uuid})\n` +
                `📈 [Hypixel Stats](https://plancke.io/hypixel/player/stats/${info.uuid})`;

        const successEmbed = new Discord.MessageEmbed()
            .setColor(e.green)
            .setThumbnail('https://crafatar.com/avatars/' + info.uuid + '?overlay=true&rand=' + Date.now())
            .setDescription(
                successMsg
            )

        db.add('verified', 1);
        db.set(`users.${message.author.id}`, info.uuid);

        loadingMessage.edit(successEmbed)
            .then(newMessage => {
                if (settings.ver_messages)
                    newMessage.delete({
                        timeout: 6000
                    }).catch(() => {});
            }).catch(() => {});

        consola.success(`${message.author.tag} successfully verified as ${info.name} in ${guild.name}`);

        if (settings.dm_verify)
            message.author.send(
                new Discord.MessageEmbed()
                    .setColor(e.green)
                    .setDescription(`${e.check} Successfully verified as \`${info.name}\` in ${message.guild.name}`)
            ).catch(() => {});

        if (settings.remove_verify) {
            if (member.roles.cache.get(settings.remove_verify))
                member.roles.remove(settings.remove_verify).catch(() => {
                    channel.send(
                        new Discord.MessageEmbed()
                            .setColor(e.red)
                            .setDescription(`${e.x} Unable to remove the role <@&${settings.remove_verify}> role.`)
                    ).catch(() => {})
                })
        }
    },
};