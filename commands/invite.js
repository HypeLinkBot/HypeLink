const Discord = require('discord.js');
const { invite_link } = require('../config.json');
const e = require('../embeds.json');
const owner = require('../lib/owner');

module.exports = {
    name: 'invite',
    description: 'DMs you the bot\'s invite link',
    cat: 'other',
    guild: false,
    alias: ['inv', 'i'],
    execute(message, args, client, prefix) {
        const invite = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(
                `:pleading_face: **How to Invite**\n` +
                `${e.bunk} [Click here](${invite_link}) or visit https://bonk.ml/invite\n\n` +
                `${e.bunk} **Bot Owner:** \`${owner(client).tag}\``
            )

        if (message.guild) {
            message.author.send(invite).then(() => {
                message.react('👌');
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