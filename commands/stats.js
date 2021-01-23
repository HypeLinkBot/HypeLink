const Discord = require('discord.js');
const { invite_link } = require('../config.json');
const e = require('../embeds.json');
const db = require('quick.db');
const owner = require('../lib/owner');

function addzero(num) {
    return (num < 10) ? "0" + num : num;
}

module.exports = {
    name: 'stats',
    description: 'Total stats for the bot',
    cat: 'other',
    alias: ['st'],
    execute(message, args, client, prefix) {
        let dateNow = new Date();
        let dateStart = new Date(db.get('startup'));

        let seconds = Math.floor((dateNow - (dateStart)) / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        let datestring = '';

        if (days !== 0) datestring = `${days} day${(days == 1) ? '' : 's'} ago`;
        else if (hours !== 0) datestring = `${hours} hours${(hours == 1) ? '' : 's'} ago`;
        else if (minutes !== 0) datestring = `${minutes} minute${(minutes == 1) ? '' : 's'} ago`;
        else datestring = `${seconds} seconds ago`;

        const invite = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(
                `:flushed: **Bot Stats**\n` +
                `${e.bunk} 🛡 **Servers**: ${client.guilds.cache.size}\n` +
                `${e.bunk} ✅ **Verifies**: ${db.get('verified').toLocaleString()}\n` +
                `${e.bunk} ❌ **Unverifies**: ${db.get('unverified').toLocaleString()}\n` +
                `${e.bunk} ♻ **Last restart**: ${datestring}\n\n` +
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