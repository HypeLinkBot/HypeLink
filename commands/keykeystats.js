const owner = require('../owner.json');
const { hypixel_key } = require('../config.json');
const grab = require('node-fetch');

module.exports = {
    name: 'keykeystats',
    description: '😳😳😳',
    cat: 'other',
    guild: false,
    alias: [],
    async execute(message, args, client, prefix) {
        if (message.author.id !== owner.id) return;

        let request = await grab('https://api.hypixel.net/key?key=' + hypixel_key)
            .catch(err => {
                return message.channel.send(err);
            })
        request = await request.json();

        if (!request.success) return console.log(request);

        const body = request.record;
        let ownerID = body.owner;
        let limit = body.limit;
        let requestsInLastMinute = body.queriesInPastMin;
        let totalQueries = body.totalQueries;

        message.channel.send(
            `:flushed: **Stats for current key:**\n` +
            `Owner: \`${ownerID}\`\n` +
            `Requests: \`${requestsInLastMinute}/${limit}\`\n` +
            `Lifetime: \`${totalQueries}\`\n`
        ).catch();
    },
};