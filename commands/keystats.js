const db = require('quick.db');
const owner = require('../lib/owner');
const { hypixel_key } = require('../config.json');
const fetch = require('node-fetch');
const e = require('../embeds.json');

module.exports = {
    name: 'keystats',
    description: '😳😳😳',
    cat: 'other',
    guild: false,
    alias: [],
    execute(message, args, client, prefix) {
        if (message.author.id !== owner(client).id) return;

        fetch('https://api.hypixel.net/key?key=' + hypixel_key)
            .then(res => res.json())
            .then(body => {
                if (!body.success) return console.log(body);

                body = body.record;
                let owneruuid = body.owner;
                let limit = body.limit;
                let reqsinlastmin = body.queriesInPastMin;
                let totalqueries = body.totalQueries;

                message.channel.send(
                    `:flushed: **Stats for current key:**\n` +
                    `Owner: \`${owneruuid}\`\n` +
                    `Requests: \`${reqsinlastmin}/${limit}\`\n` +
                    `Lifetime: \`${totalqueries}\`\n`
                );
            })
            .catch(console.error)
    },
};