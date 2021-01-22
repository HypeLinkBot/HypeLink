module.exports = {
    name: 'ping',
    description: 'A test command to see if the bot is online',
    cat: 'other',
    alias: ['p', 'test'],
    execute(message, args) {
        message.channel.send(':ping_pong: pong.');
    },
};