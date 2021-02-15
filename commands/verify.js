const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
const ee = require('../embeds.json');
const get = require('../lib/getStats');

module.exports = {
    name: 'verify',
    description: 'Verify with Hypixel',
    cat: 'settings',
    alias: ['v'],
    guild: true,
    async execute(message, args, client, prefix) {
        let roleid = db.get(`${message.guild.id}.roles.verified`);
        let role = message.guild.roles.cache.get(roleid);

        let whitelist = db.get(`${message.guild.id}.whitelisted`);
        if (whitelist !== null && whitelist !== undefined && message.channel.id !== whitelist) {
            let dm = `${e.x} You can't verify in that channel.`;

            if (message.member.hasPermission('ADMINISTRATOR')) {
                dm += `\n${e.bunk} *(because you have administrator, you can change*\n` +
                    `${e.bunk} *this by using \`${prefix}whitelist\` in that channel.*`
            }

            message.author.send(
                new Discord.MessageEmbed()
                .setColor(ee.red)
                .setDescription(dm)
            ).catch();

            message.delete().catch();
            return;
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

        if (message.member.roles.cache.has(roleid)) {
            const embed = new Discord.MessageEmbed()
                .setColor(ee.red)
                .setDescription(`${e.x} You\'re already verified`);

            // \n${e.tab} Use \`${prefix}unverify\` to unverify yourself.

            return message.channel.send(embed);
        }

        if (args.join('').length < 2) {
            let text = `**${e.check} Verification Instructions**:\n` +
                ` • Log on to Hypixel\n` +
                ` • Right-click your head in the main lobby\n` +
                ` • Left-click \`Social Media\`\n` +
                ` • Left-click \`Discord\`\n` +
                ` • Type your Discord tag in chat\n` +
                ` • Type \`${prefix}${this.name} [Your Minecraft Username]\` here`

            return message.channel.send(text += '\nhttps://gfycat.com/dentaltemptingleonberger');
        }

        let newmsg = await message.channel.send(new Discord.MessageEmbed()
            .setColor('GRAY')
            .setDescription(
                `${e.loading} Please wait...\n` +
                `${e.tab} Contacting ${e.logo}Hypixel\'s API...`
            ));

        let username = args.join('');

        get.form(username, async(body) => {
            //console.log(body);

            if (body.error) {
                const embed = new Discord.MessageEmbed()
                    .setColor(ee.red)
                    .setDescription(`${e.x} **${body.errorMsg}**\nDouble check your username and try again in a few minutes.`);

                return newmsg.edit(embed);
            }

            if (message.author.tag !== body.discord) {

                const embed = new Discord.MessageEmbed()
                    .setColor(ee.red)
                    .setDescription(
                        `${e.x} **Error: Tag Mismatch**\n\`${body.name}\`'s set Discord (\`${(!body.discord) ? 'None#0000' : body.discord}\`)\n` +
                        `doesn't match your tag (\`${message.author.tag}\`)\n\n` +
                        `**If you just updated it, wait a minute and try again.**` +
                        `\nFor linking instructions, do \`${prefix}verify\``
                    )

                return newmsg.edit(embed);
            }

            let success = true;
            if (role !== undefined && role !== null) {
                await message.member.roles.add(role).catch(() => {
                    const embed = new Discord.MessageEmbed()
                        .setColor(ee.red)
                        .setDescription(`${e.x} **Couldn't give you the Verified role**\n${ee.bunk} Make sure the role isn't higher than me :flushed:`);

                    success = false;
                    return newmsg.edit(embed);
                });

                if (db.get(`${message.guild.id}.rank_role`) == null || db.get(`${message.guild.id}.rank_role`) == true) {
                    if (body.rank !== null) {
                        let roleid = db.get(`${message.guild.id}.roles.${body.rank}`)
                        if (roleid !== null && roleid !== undefined) {
                            await message.member.roles.add(roleid).catch(() => {
                                const embed = new Discord.MessageEmbed()
                                    .setColor(ee.red)
                                    .setDescription(`${e.x} **Couldn't give you the ${body.rank.replace(/_PLUS/g, '+')} role**\n${e.bunk} Make sure the role isn't higher than me :flushed:`);

                                success = false;
                                return newmsg.edit(embed);
                            });
                        }
                    }
                }

                if (!success) return;

                let desc = `${e.check} **You're all set**!\n<@!${message.author.id}> verified as \`${body.name}\`\n\n<:namemc:810626872990892083> [NameMC Profile](https://namemc.com/${body.uuid})\n📈 [Hypixel Stats](https://plancke.io/hypixel/player/stats/${body.uuid})\n\n`;

                // switch (body.name.toLowerCase()) {
                //     case 'xdabdoub':
                //         desc += `${e.bunk} hi dab :3\n\n`
                //         break;
                //     case 'foobball':
                //         desc += `${e.bunk} :flushed: :flushed: :flushed:\n\n`
                //         break;
                //     case 'carbonate':
                //         desc += `${e.bunk} hi carbs :3\n\n`
                //         break;
                //     case 'bowspleefed':
                //         desc += `${e.bunk} hi trick :3\n\n`
                //         break;
                // }

                if (db.get(`${message.guild.id}.change_nick`) == true || db.get(`${message.guild.id}.change_nick`) == null) {
                    message.member.setNickname(body.name).catch(() => {
                        //desc += `*(because your role is above the bot,*\n${e.bunk} *your nickname couldn't be changed)*`;
                    });
                }

                let allowUnv = db.get(`${message.guild.id}.allow_unverify`);
                if (allowUnv == null || allowUnv == true) {
                    // desc += `${e.bunk} To unverify, use the command \`${prefix}unverify\``;
                }

                let successembed = new Discord.MessageEmbed()
                    .setColor(ee.green)
                    .setThumbnail("https://crafatar.com/avatars/" + body.uuid)
                    .setDescription(desc);

                if (!success) return;
                newmsg.edit(successembed).then(() => {
                    db.set('verified', db.get('verified') + 1);
                });

                let removev = db.get(`${message.guild.id}.remove_verify`);
                if (removev !== null && removev !== false && removev !== undefined) {
                    if (message.member.roles.cache.get(removev) !== null) {
                        // consola.info(`Removing a role from ${message.author.tag}...`);
                        message.member.roles.remove(removev).then(() => {
                            // consola.success(`Role removed from ${message.author.tag}!`);
                        }).catch(() => {
                            message.channel.send(new Discord.MessageEmbed()
                                .setColor(ee.red)
                                .setDescription(`${e.x} Unable to remove the role <@!${removev}> role.`)).catch()
                        });
                    }
                }

                if (db.get(`${message.guild.id}.dm_verify`) == true) {
                    message.author.send(
                        new Discord.MessageEmbed()
                        .setColor(ee.green)
                        .setDescription(`${e.check} You were successfully verified as **${body.name}** in **${message.guild.name}**`)).catch()
                }

                consola.success(`${body.name} was verified in ${message.guild.name}`);
            } else {
                let msg = `${e.x} Couldn\'t give you the verified role`
                if (message.member.hasPermission('MANAGE_ROLES')) {
                    msg += `\n${e.bunk} *please configure this server by using ${prefix}setup*`
                }

                let errembed = new Discord.MessageEmbed()
                    .setColor(ee.red)
                    .setDescription(msg)
                newmsg.edit(errembed);
            }
        })
    },
};