const Discord = require("discord.js");
const fetch = require('node-fetch');
const e = require('../embeds.json');
const owner = require('../lib/owner');
const os = require('os');
const version = '2.1.7';

module.exports = {
    name: 'ping',
    description: 'Returns the bot\'s ping :flushed:',
    cat: 'other',
    alias: ['p', 'test', 'hi', 'hello', 'ilovetheflushedemojiverymuch'],
    guild: false,
    async execute(message, args, client) {
        let latency = Math.abs(Math.floor(Date.now() - message.createdTimestamp));
        let apiping = Math.floor(client.ws.ping);

        message.channel.send(new Discord.MessageEmbed().setDescription(`${e.loading} Pinging...`))
            .then(async(newmsg) => {
                let roundtrip = Math.abs(Math.floor(Date.now() - newmsg.createdTimestamp));
                let hyp = Date.now();
                let hypms = ':x: dead lol';

                await fetch('https://api.hypixel.net/', {
                    timeout: 10000
                }).then(() => {
                    hypms = Math.abs(Math.floor(Date.now() - hyp)) + 'ms'
                }).catch((e) => {
                    // console.error(e);
                })

                let total_mem = Math.floor(os.totalmem() / 1024 / 1024);
                let free_mem = Math.floor(os.freemem() / 1024 / 1024);

                // console.log(total_mem, free_mem);

                newmsg.edit(new Discord.MessageEmbed().setDescription(
                    `:ping_pong: **Pong!**\n` +
                    `${e.bunk} ☁️ **Latency**: ${latency.toLocaleString()}ms\n` +
                    `${e.bunk} 🤖 **API**: ${apiping.toLocaleString()}ms\n` +
                    `${e.bunk} ♻️ **Roundtrip**: ${roundtrip.toLocaleString()}ms\n` +
                    `${e.bunk} ${e.logo} **Hypixel**: ${hypms.toLocaleString()}\n\n` +
                    `${e.bunk} :flushed: **Memory**: ${free_mem.toLocaleString()}MB out of ${total_mem.toLocaleString()}MB`
                ).setFooter(`Bot by ${owner(client).tag} | https://bonk.ml/`, owner(client).avatarURL())).then(() => {
                    if (message.guild) {
                        if (!message.member.hasPermission('MANAGE_MESSAGES')) newmsg.delete({ timeout: 10000 }).catch();
                    }
                }).catch();
            }).catch();
    },
};