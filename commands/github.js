const Discord = require('discord.js');
const e = require('../embeds.json');

module.exports = {
    name: 'github',
    description: 'DMs you the HypeLink Github link',
    cat: 'other',
    guild: false,
    alias: ['git', 'g'],
    execute(message, args, client, prefix) {
        const invite = new Discord.MessageEmbed()
            .setDescription(
                `${e.github} **Github Link**\n` +
                `${e.bunk} https://github.com/foobball/HypeLink`
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