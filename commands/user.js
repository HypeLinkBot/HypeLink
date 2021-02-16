const db = require('quick.db');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const e = require('../embeds.json');
const owner = require('../lib/owner')

module.exports = {
    name: 'user',
    description: '📈 User stat websites',
    cat: 'settings',
    alias: ['link', 'hypixel', 'links'],
    guild: false,
    async execute(message, args, client, prefix) {
        if (args.length == 0) {
            return message.channel.send(new Discord.MessageEmbed().setDescription(`${e.x} **Invalid command usage**\n\`${prefix}user [Username]\``).setColor(e.red))
        }

        let req = await fetch('https://playerdb.co/api/player/minecraft/' + args[0])
        req = await req.json();

        if (req.error) {
            return message.channel.send(new Discord.MessageEmbed().setDescription(`${e.x} **Player not found**\nIf you think this is a mistake, contact \`${owner(client).tag}\`.`).setColor(e.red))
        }

        let names = [];
        let name_history = req.data.player.meta.name_history;
        name_history.forEach(entry => {
            names.push(entry.name);
        })

        names.reverse();
        names.shift();

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
            .setTitle(`✨ ${username} Overview`);

        if (names.length > 0) {
            embed.addField(
                '<:namehistory:811082758754664459> __Name History__',
                `${names.join(', ').replace(/_/g, '\\_')}`
            )
        }

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
            .setColor('#FFCE63')
            .setThumbnail(avatar)
            .setFooter(`UUID: ${id}`)

        message.channel.send(embed);
    },
};