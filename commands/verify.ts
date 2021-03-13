const db = require('quick.db');
const Discord = require('discord.js');
const e = require('../embeds.json');
const consola = require('consola');
const getUser = require('../lib/getStats.ts').getUser;

module.exports = {
    name: 'verify',
    description: 'Verify with Hypixel',
    cat: 'settings',
    alias: ['v', 'ver', 'guide'],
    guild: true,
    async execute(message, args, client, prefix) {
        const {
            guild,
            channel,
            member
        } = message;
        const guildID = guild.id;

        const whitelistedChannel = db.get(`${guildID}.whitelisted`);
        if (whitelistedChannel) {
            if (whitelistedChannel !== channel.id) {
                let errorDM = `${e.x} You can't verify in <#${channel.id}>\n`;

                if (member.hasPermission('ADMINISTRATOR')) {
                    errorDM +=
                        `*Because you have administrator, you can change*\n` +
                        `*this by sending \`${prefix}whitelist\` in <#${channel.id}> or*\n` +
                        `*doing \`${prefix}whitelist reset\` to remove it.*`;
                }

                message.author.send(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(errorDM)
                ).catch();

                return message.delete().catch();
            }
        }

        let verificationRoleID = db.get(`${guildID}.roles.verified`);
        let verificationRole = guild.roles.cache.get(verificationRoleID);

        if (args.join(' ').length < 2) {
            return channel.send(
                `**${e.check} Verification Instructions**:\n` +
                ` • Log on to Hypixel\n` +
                ` • Right-click your head in the main lobby\n` +
                ` • Left-click \`Social Media\`\n` +
                ` • Left-click \`Discord\`\n` +
                ` • Type your Discord tag (\`${message.author.tag}\`) in chat\n` +
                ` • Send \`${prefix}${this.name} [Your Minecraft Username]\` here\n` +
                `**Video Guide:** https://youtu.be/355yO2lVOXg`
            ).catch();
        }

        if (verificationRole == undefined) {
            const HyVerifyRole = guild.roles.cache.find(r => r.name == 'Hypixel Verified');
            if (HyVerifyRole !== undefined) {
                db.set(`${guildID}.roles.verified`, HyVerifyRole.id);
                verificationRole = HyVerifyRole;
            } else {
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
        }

        if (member.roles.cache.has(verificationRoleID)) {
            return channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **You're already verified**!`
                    )
            ).catch();
        }

        const loadingMessage = await channel.send(
            new Discord.MessageEmbed()
                .setColor(e.default)
                .setDescription(
                    `${e.loading} Please wait...\n` +
                    `Contacting ${e.logo}Hypixel's API`
                )
        )

        const username = args.join('');
        const info = await getUser(username, db.get(`${guildID}.guild_name`));

        if (info.error) {
            return loadingMessage.edit(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **${info.errorMsg} :sob:**\n` +
                        `Double check your username and try again.`
                    )
            ).catch();
        }

        const verifyingTag = message.author.tag;
        if (verifyingTag !== info.discord) {
            return loadingMessage.edit(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **Tag Mismatch :sob:**\n` +
                        `\`${info.name}\`'s set Discord (\`${info.discord}\`)\n` +
                        `doesn't match your tag (\`${verifyingTag}\`)\n\n` +
                        `👉 **For linking instructions, send \`${prefix}guide\`** 👈`
                    )
            ).catch();
        }

        const sbzcheck = db.get(`${guildID}.sbz_scammers`);
        if (sbzcheck == false) {
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
                ).catch();
            }
        }

        const guildMatch = db.get(`${guildID}.guild_match`);
        const serverGuild = db.get(`${guildID}.guild_name`);
        let matches = true;
        if (guildMatch) {
            if (serverGuild !== null && serverGuild !== false) {
                if (info.guild) {
                    if (info.guild.name.toLowerCase() !== serverGuild.toLowerCase()) matches = false;
                } else matches = false;
            }
        }

        if (!matches) {
            let errorMessage = `${e.x} **Guild Mismatch :sob:**\n` +
                `You must be in the Hypixel guild \`${serverGuild}\` to verify in this server.`;

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
                ).catch();
            })

        const rankRoleSetting = db.get(`${guildID}.rank_role`);
        if (rankRoleSetting == null || rankRoleSetting == true) {
            if (info.rank) {
                const rankRoleID = db.get(`${guildID}.roles.${info.rank}`);
                const roleObject = guild.roles.cache.get(rankRoleID);

                if (roleObject) {
                    await member.roles.add(rankRoleID).catch(() => {
                        successfullyVerified = false;
                        return loadingMessage.edit(
                            new Discord.MessageEmbed()
                                .setColor(e.red)
                                .setDescription(
                                    `${e.x} **Couldn't give you the ${info.rank.replace(/_PLUS/g, '+')} role :sob:**\n` +
                                    `Make sure the <@&${rankRoleID}> role isn't above me.`
                                )
                        ).catch();
                    })
                }
            }
        }

        if (!successfullyVerified) return;

        let customEmoji = '';

        if (info.uuid)
        switch (info.name.toLocaleString()) {
            case 'foobball':
            case 'xdabdoub':
                customEmoji = ':heart: '
                break;
        }

        let successMsg =
            `${e.check} **You're all set**!\n` +
            `<@!${message.author.id}> verified as ${customEmoji}\`${info.name.replace(/_/g, '\\_')}\``

        if (info.guild) {
            successMsg +=
                `\nfrom guild \`${info.guild.name}\``;
        }

        const verifyLinks = db.get(`${guildID}.verify_links`);
        if (verifyLinks !== false) {
            successMsg +=
                `\n\n<:namemc:810626872990892083> [NameMC Profile](https://namemc.com/${info.uuid})\n` +
                `📈 [Hypixel Stats](https://plancke.io/hypixel/player/stats/${info.uuid})`;
        }

        const successEmbed = new Discord.MessageEmbed()
            .setColor(e.green)
            .setThumbnail('https://crafatar.com/avatars/' + info.uuid + '?overlay=true&rand=' + Date.now())
            .setDescription(
                successMsg
            )

        db.add('verified', 1);
        db.set(`users.${message.author.id}`, info.uuid)

        loadingMessage.edit(successEmbed).catch();

        const removeRole = db.get(`${guildID}.remove_verify`);
        consola.success(`${message.author.tag} successfully verified as ${info.name} in ${guild.name}`);

        if (removeRole && removeRole !== false) {
            if (member.roles.cache.get(removeRole)) {
                member.roles.remove(removeRole).catch(() => {
                    channel.send(
                        new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(`${e.x} Unable to remove the role <@!${removeRole}> role.`)
                    ).catch()
                });
            }
        }
    },
};