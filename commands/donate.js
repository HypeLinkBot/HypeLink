const Discord = require('discord.js');
const e = require('../embeds.json');
const owner = require('../lib/owner');

module.exports = {
    name: 'donate',
    description: 'If you want to support the bot :point_right::point_left:',
    cat: 'other',
    guild: false,
    alias: ['donation', 'don', 'd'],
    execute(message, args, client, prefix) {
        const invite = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(
                `:flushed: **Donation link**\n` +
                `${e.bunk} [paypal.me/foobball](https://paypal.me/foobball)\n\n` +
                `${e.bunk} thank you so much :heart::pleading_face:`
            ).setFooter(`Bot by ${owner(client).tag} | https://bonk.ml/`, owner(client).avatarURL())

        if (message.guild) {
            message.author.send(invite).then(() => {
                message.react('💖');
            }).catch(() => {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **Please enable DMs from server members.**`);
                message.channel.send(embed).then((newmsg) => {
                    newmsg.delete({ timeout: 4000 });
                });
            });
        } else {
            message.author.send(invite).catch();
        }
    },
};