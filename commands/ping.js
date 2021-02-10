const Discord = require("discord.js");
const e = require('../embeds.json');

module.exports = {
    name: 'ping',
    description: 'Returns the bot\'s ping :flushed:',
    cat: 'other',
    alias: ['p', 'test', 'hi', 'hello'],
    guild: false,
    execute(message, args, client) {
        let latency = Math.abs(Math.floor(Date.now() - message.createdTimestamp));
        let apiping = Math.floor(client.ws.ping);

        message.channel.send(new Discord.MessageEmbed().setDescription(`${e.loading} Pinging...`))
            .then((newmsg) => {
                let roundtrip = Math.abs(Math.floor(Date.now() - newmsg.createdTimestamp));

                newmsg.edit(new Discord.MessageEmbed().setDescription(
                    `:ping_pong: **Pong!**\n` +
                    `${e.bunk} ☁️ **Latency**: ${latency}ms\n` +
                    `${e.bunk} 🤖 **API**: ${apiping}ms\n` +
                    `${e.bunk} 💓 **Heartbeat**: ${roundtrip}ms\n` +
                    `${e.bunk} ${e.logo} **Hypixel**: ¯\\\\\\_(ツ)\\_/¯`
                )).then(() => {
                    if (message.guild) newmsg.delete({ timeout: 10000 }).catch();
                }).catch();
            }).catch();
    },
};