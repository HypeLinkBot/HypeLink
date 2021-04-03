const Discord = require('discord.js');
const { report_channel } = require('../config.json');
const e = require('../embeds.json');

module.exports = {
    name: 'report',
    description: 'Report a problem with the bot',
    cat: 'other',
    guild: false,
    alias: ['problem', 'bug', 'bugreport'],
    execute(message, args, client, prefix) {
        let blacklist = require('../blacklist.json').reportandsuggest;
        if (blacklist.indexOf(message.author.id) > -1) {
            console.log('blacklisted mf ' + message.author.tag);
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setTitle(`${e.x} Report Blacklist`)
                    .setDescription(
                        `You're blacklisted from using the report command for HypeLink.\n\n` +
                        `Join the support server using \`${prefix}support\` for more information.`
                    )
            ).catch();
        }

        const reportchannel = client.channels.cache.get(report_channel);

        if (args.join(' ').length < 10) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(`${e.x} **Your report must be at least 10 characters.**\nExample: \`${prefix}report Can't verify\``);
            message.channel.send(embed).then((newmsg) => {
                if (message.guild) newmsg.delete({ timeout: 10000 }).catch();
            });
        } else {
            reportchannel.send(`${message.author.tag} | ${message.author.id}\n${args.join(' ').substr(0, 1000)}`).then(() => {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.green)
                    .setDescription(`${e.check} **Report submitted successfully!**`);
                message.channel.send(embed).then((newmsg) => {
                    if (message.guild) newmsg.delete({ timeout: 10000 }).catch();
                });
            }).catch(() => {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **Your report couldn't be submitted**\nuhhh this should never happen, please dm foob`);
                message.channel.send(embed).then((newmsg) => {
                    if (message.guild) newmsg.delete({ timeout: 10000 }).catch();
                });
            })
        }
    },
};