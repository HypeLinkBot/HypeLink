const { ShardingManager } = require('discord.js');
const consola = require('consola');
const db = require('quick.db');
const manager = new ShardingManager('./app.js', { token: require('./config.json').bot_token });

manager.on('shardCreate', shard => consola.success(`Launched shard ${shard.id}`));
manager.spawn();

consola.info(`Global Verified: ${db.get('verified').toLocaleString()}`);
consola.info(`Global Unverified: ${db.get('unverified').toLocaleString()}`);