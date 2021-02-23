const Discord = require('discord.js');
const { invite_link } = require('../config.json');
const e = require('../embeds.json');
const db = require('quick.db');
const owner = require('../lib/owner');

function addzero(num) {
    return (num < 10) ? "0" + num : num;
}

const getUserCount = (client) => {
    let memberCount = 0;
    client.guilds.cache.forEach(g => {
        memberCount += g.memberCount;
    })
    return memberCount;
}

module.exports = {
    name: 'stats',
    description: 'Total stats for the bot',
    cat: 'other',
    alias: ['st'],
    guild: false,
    execute(message, args, client, prefix) {
        let dateNow = new Date();
        let dateStart = new Date(db.get('startup'));

        let seconds = Math.floor((dateNow - (dateStart)) / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        let datestring = '';

        if (days !== 0) datestring = `${days} day${(days == 1) ? '' : 's'}`;
        else if (hours !== 0) datestring = `${hours} hour${(hours == 1) ? '' : 's'}`;
        else if (minutes !== 0) datestring = `${minutes} minute${(minutes == 1) ? '' : 's'}`;
        else datestring = `${seconds} second${(seconds == 1) ? '' : 's'}`;
        datestring += ' ago';

        const statslist = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(
                `:flushed: **Bot Stats**\n` +
                `${e.bunk} 🛡 **Servers**: ${client.guilds.cache.size.toLocaleString()}\n` +
                `${e.bunk} 👤 **Users**: ${getUserCount(client).toLocaleString()}\n` +
                `${e.bunk} ✅ **Verifies**: ${db.get('verified').toLocaleString()}\n` +
                `${e.bunk} ❌ **Unverifies**: ${db.get('unverified').toLocaleString()}\n` +
                `${e.bunk} ♻ **Last restart**: ${datestring}\n\n` +
                `${e.bunk} **Bot Owner:** \`${owner(client).tag}\``
            )


        if (message.guild) {
            message.author.send(statslist).then(() => {
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
            message.author.send(statslist).catch();
        }
    },
};