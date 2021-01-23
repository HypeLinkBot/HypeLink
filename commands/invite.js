const Discord = require('discord.js');
const { invite_link } = require('../config.json');
const e = require('../embeds.json');
const owner = require('../lib/owner');

module.exports = {
    name: 'invite',
    description: 'Invite the bot to your own server',
    cat: 'other',
    alias: ['inv', 'i'],
    execute(message, args, client, prefix) {
        const invite = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(
                `:pleading_face: **How to Invite**\n` +
                `${e.bunk} [Click here](${invite_link}) or visit https://bonk.ml/invite\n\n` +
                `${e.bunk} **Bot Owner:** \`${owner(client).tag}\`\n` +
                `${e.bunk} *if this tag is invalid, run this command again*`
            )
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
    },
};