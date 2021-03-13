const db = require('quick.db');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const e = require('../embeds.json');
const config = require('../config.json');

module.exports = {
    name: 'user',
    description: '📈 User stat websites',
    cat: 'settings',
    alias: ['link', 'hypixel', 'links', 'me'],
    guild: false,
    async execute(message, args, client, prefix) {
        message.channel.startTyping().catch();

        let userid;
        if (args.length === 0) {
            let saveduser = db.get(`users.${message.author.id}`);

            if (!saveduser) {
                message.channel.stopTyping();
                return message.channel.send(new Discord.MessageEmbed().setDescription(`${e.x}:sob: **Command error**\nYour Hypixel and Discord accounts weren't recently linked.\nUse the \`${prefix}verify\` command in a server to link them.\n\nIf you want to view another user, send \`${prefix}user [username]\``).setColor(e.red))
            }

            userid = saveduser;
        } else userid = args[0]

        let req = await fetch('https://playerdb.co/api/player/minecraft/' + userid)
        req = await req.json();

        if (req.error) {
            message.channel.stopTyping();
            return message.channel.send(new Discord.MessageEmbed().setDescription(`${e.x} **Player not found**\nIf you think this is a mistake, contact \`foob#9889\`.`).setColor(e.red))
        }

        let hypixelstats = await fetch(`https://api.slothpixel.me/api/players/${userid}?key=${config.hypixel_key}`)
        hypixelstats = await hypixelstats.json();

        let socialmedia = hypixelstats.links;
        let socialmediastr = '';

        console.log(socialmedia);

        if (socialmedia) {
            if (socialmedia.YOUTUBE) {
                socialmediastr += `<:YOUTUBE:815304268620890163> **[YouTube](${socialmedia.YOUTUBE})**\n`
            }
            if (socialmedia.DISCORD) {
                if (socialmedia.DISCORD.indexOf('#') > -1) {
                    socialmediastr += `<:DISCORD:815301286874185759> **Discord:** ${socialmedia.DISCORD}\n`
                } else {
                    socialmediastr += `<:DISCORD:815301286874185759> **[Discord](${socialmedia.DISCORD})**\n`
                }
            }
            if (socialmedia.TWITTER) {
                if (socialmedia.TWITTER.indexOf('http') > -1) {
                    socialmediastr += `<:TWITTER:815301660976087071> **[Twitter](${socialmedia.TWITTER})**\n`
                } else {
                    socialmediastr += `<:TWITTER:815301660976087071> **Twitter:** ${socialmedia.TWITTER}\n`
                }
            }
            if (socialmedia.TWITCH) {
                if (socialmedia.TWITCH.indexOf('http') > -1) {
                    socialmediastr += `<:TWITCH:815304122190135376> **[Twitch](${socialmedia.TWITCH})**\n`
                } else {
                    socialmediastr += `<:TWITCH:815304122190135376> **Twitch:** ${socialmedia.TWITCH}\n`
                }
            }
            if (socialmedia.INSTAGRAM) {
                if (socialmedia.INSTAGRAM.indexOf('http') > -1) {
                    socialmediastr += `<:INSTAGRAM:815303985187389481> **[Instagram](${socialmedia.INSTAGRAM})**\n`
                } else {
                    socialmediastr += `<:INSTAGRAM:815303985187389481> **Instagram:** ${socialmedia.INSTAGRAM}\n`
                }
            }
            if (socialmedia.HYPIXEL) {
                socialmediastr += `<:logo:791084884398702632> **[Forums](${socialmedia.HYPIXEL})**\n`
            }
        }

        let names = [];
        let name_history = req.data.player.meta.name_history;
        name_history.forEach(entry => {
            names.push(entry);
        })

        names.reverse();
        if (names.length === 1) names.shift();
        names = names.slice(0, 5);

        let { username, id, raw_id, avatar } = req.data.player;

        let namemc = `https://namemc.com/${raw_id}`;
        let plancke = `https://plancke.io/hypixel/player/stats/${raw_id}`;
        let karma25 = `https://25karma.xyz/#player/${raw_id}`;

        let hystats = `http://hystats.net/player/${id}`;
        let quests = `https://notifly.zone/quests/${username}`;
        let ap = `https://notifly.zone/achievements/${username}`;

        let buildbattle = `https://monochrontools.com/player/stats/${username}`;
        let murdermystery = `https://developer64.com/project/mm-stats-view?ign=${username}`;
        let skyblock = `https://sky.shiiyu.moe/stats/${id}`;
        let thepit = `https://pitpanda.rocks/players/${raw_id}`;

        const embed = new Discord.MessageEmbed()
            .setTitle(`✨ ${username} Overview`)
            .setColor('#FFCE63')
            .setThumbnail(avatar + '?hour=' + new Date().getHours() + '&overlay=true')
            .setFooter(`UUID: ${id}`);

        if (names.length > 0) {
            let namestr = '';
            names.forEach(entry => {
                let formname = entry.name.replace(/\_/g, '\\_');

                if (entry.changedToAt == null) {
                    return namestr += `**${formname}** | Original username`
                }

                let date = new Date(entry.changedToAt);
                namestr += `**${formname}** | ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`;
            })

            embed.addField(
                '<:namehistory:811082758754664459> __Recent Name History__',
                `${namestr}`
            )
        }

        if (socialmedia) {
            embed
                .addField('⚙ __General__',
                    `<:namemc:810626872990892083> [NameMC](${namemc})\n` +
                    `<:plancke:811074649386647592> [Plancke](${plancke})\n` +
                    `<:25karma:811074881705345025> [25Karma](${karma25})`,
                    true
                )
                .addField('📶 __Network__',
                    `<:hystats:811080105446473780> [Hystats](${hystats})\n` +
                    `📜 [Quests](${quests})\n` +
                    `✨ [AP](${ap})`,
                    true
                )
                .addField('🎮 __Game Specific__',
                    `<:buildbattle:811077921560985690> [Build Battle](${buildbattle})\n` +
                    `<:mm:811078483161251889> [Murder Mystery](${murdermystery})\n` +
                    `<:sb:811078483056394280> [Skyblock](${skyblock})\n` +
                    `<:thepit:811078483030966313> [The Pit](${thepit})`,
                    true
                )
        } else {
            embed.setDescription(`:x: **This user has never logged into Hypixel.**\n\n<:namemc:810626872990892083> [NameMC](${namemc})`)
        }

        if (socialmediastr) {
            embed.addField('📎 __Linked accounts__',
                `${socialmediastr}`,
                true
            )
        }

        message.channel.stopTyping();
        return message.channel.send(embed);
    },
};