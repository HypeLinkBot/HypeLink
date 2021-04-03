const { ShardingManager } = require('discord.js');
const consola = require('consola');
const db = require('quick.db');
const manager = new ShardingManager('./bot.js', {
    token: require('./config.json').bot_token,
    totalShards: 1
});

consola.info(`Global Verified: ${db.get('verified').toLocaleString()}`);
consola.info(`Global Unverified: ${db.get('unverified').toLocaleString()}`);

manager.on('shardCreate', shard => {
    consola.log(`----- SHARD ${shard.id} LAUNCHED -----`);
    shard
        .on('death', () => consola.log(`----- SHARD ${shard.id} DIED -----`))
        .on('ready', () => consola.log(`----- SHARD ${shard.id} READY -----`))
        .on('disconnect', () => consola.log(`----- SHARD ${shard.id} DISCONNECTED -----`))
        .on('reconnecting', () => consola.log(`----- SHARD ${shard.id} RECONNECTING -----`));
});

manager.spawn().then();