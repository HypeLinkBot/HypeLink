const Discord = require('discord.js');
const { suggest_channel } = require('../config.json');
const e = require('../embeds.json');

module.exports = {
    name: 'suggest',
    description: 'Request a feature for the bot',
    cat: 'other',
    alias: ['sug', 'suggestion', 'request'],
    guild: false,
    execute(message, args, client, prefix) {
        let blacklist = require('../blacklist.json').reportandsuggest;
        if (blacklist.indexOf(message.author.id) > -1) {
            console.log('blacklisted mf ' + message.author.tag);
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setTitle(`${e.x} Suggestion Blacklist`)
                    .setDescription(
                        `You're blacklisted from using the suggest command for HypeLink.\n\n` +
                        `Join the support server using \`${prefix}support\` for more information.`
                    )
            ).catch();
        }

        const suggestChannel = client.channels.cache.get(suggest_channel);

        if (args.join(' ').length < 10) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(`${e.x} **Your suggestion must be at least 10 characters.**\nExample: \`${prefix}suggest Guild support 🥺🙏 \``);
            message.channel.send(embed).then((newmsg) => {
                if (message.guild) newmsg.delete({ timeout: 10000 }).catch();
            });
        } else {
            suggestChannel.send(`${message.author.tag} | ${message.author.id}\n${args.join(' ').substr(0, 1000)}`).then(() => {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.green)
                    .setDescription(
                        `${e.check} **Suggestion submitted successfully!**\n` +
                        `**:point_right: PLEASE NOTE THAT THIS COMMAND IS FOR ONLY [HYPELINK](https://bonk.ml/) :point_left:\n` +
                        `**If your idea is added, foob will DM you 😳`);
                message.channel.send(embed).then((newmsg) => {
                    if (message.guild) newmsg.delete({ timeout: 15000 }).catch();
                });
            }).catch(() => {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **Your suggestion couldn't be submitted**\nuhhh this should never happen`);
                message.channel.send(embed).then((newmsg) => {
                    if (message.guild) newmsg.delete({ timeout: 10000 }).catch();
                });
            })
        }
    },
};