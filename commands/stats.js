const Discord = require('discord.js');
const e = require('../embeds.json');
const db = require('quick.db');
const owner = require('../owner.json');
const os = require('os');

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
    async execute(message, args, client, prefix) {
        let dateNow = new Date();
        let dateStart = new Date(db.get('startup'));

        let seconds = Math.floor(client.uptime / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        let datestring = '';

        if (days !== 0) datestring = `${days} day${(days === 1) ? '' : 's'}`;
        else if (hours !== 0) datestring = `${hours} hour${(hours === 1) ? '' : 's'}`;
        else if (minutes !== 0) datestring = `${minutes} minute${(minutes === 1) ? '' : 's'}`;
        else datestring = `${seconds} second${(seconds === 1) ? '' : 's'}`;
        datestring += ' ago';

        let servercount = await client.shard.fetchClientValues('guilds.cache.size');
        let servernum = 0;

        servercount.forEach(val => {
            servernum += val;
        })

        let total_mem = Math.floor(os.totalmem() / 1024 / 1024);
        let free_mem = Math.floor(os.freemem() / 1024 / 1024);

        const percent = Math.round(free_mem / total_mem * 10000)/ 100;

        let OSseconds = Math.floor(os.uptime());
        let OSminutes = Math.floor(OSseconds / 60);
        let OShours = Math.floor(OSminutes / 60);
        let OSdays = Math.floor(OShours / 24);

        let OSdatestring = '';

        if (OSdays !== 0) OSdatestring = `${OSdays} day${(OSdays === 1) ? '' : 's'}`;
        else if (OShours !== 0) OSdatestring = `${OShours} hour${(OShours === 1) ? '' : 's'}`;
        else if (OSminutes !== 0) OSdatestring = `${OSminutes} minute${(OSminutes === 1) ? '' : 's'}`;
        else OSdatestring = `${OSseconds} second${(OSseconds === 1) ? '' : 's'}`;

        const statsList = new Discord.MessageEmbed()
            .setColor(e.default)
            .setTitle(`:flushed: **Bot Stats**`)
            .setDescription(
                `🛡 **Servers**: ${servernum.toLocaleString()}\n` +
                `👤 **Users**: ${getUserCount(client).toLocaleString()}\n` +
                `✅ **Verified**: ${db.get('verified').toLocaleString()}\n\n` +
                // `❌ **Unverifies**: ${db.get('unverified').toLocaleString()}\n` +
                `♻ **Last restart**: ${datestring}\n` +
                `📥 **Uptime**: ${OSdatestring}\n` +
                `💻 **Memory**: ${percent}% in use`
            )
            .setFooter(`Bot by ${owner.tag} | https://bonk.ml/`, owner.avatarURL)

        if (message.guild)
            message.author.send(statsList).then(() => {
                message.react('👌').catch();
            }).catch(() => {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **Please enable DMs from server members.**`);

                message.channel.send(embed).then(newMessage => {
                    newMessage.delete({
                        timeout: 10000
                    }).catch();
                }).catch();
            });
        else message.author.send(statsList).catch();
    },
};