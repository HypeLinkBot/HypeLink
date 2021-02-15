const Discord = require('discord.js');
const db = require('quick.db');
const owner = require('../lib/owner');
const e = require('../embeds.json');

module.exports = {
    name: 'db',
    description: '😳😳😳',
    cat: 'other',
    guild: false,
    alias: [],
    execute(message, args, client, prefix) {
        if (message.author.id !== owner(client).id) return message.channel.send(':flushed:').then((newmsg) => { newmsg.delete({ timeout: 4000 }).catch() }).catch();

        message.channel.send('here you go dummy', {
            files: [
                './json.sqlite'
            ]
        });
    },
};