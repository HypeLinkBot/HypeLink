const db = require('quick.db');
//const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');
//const ranks = require('../ranks.json');

const dict = {
    'changenick': {
        form: "Change Nickname",
        desc: "Change a user's nickname when they verify to their Hypixel IGN.",
        short: "ChangeNick",
        db: "change_nick"
    },
    'rankrole': {
        form: "Hypixel Rank as Role",
        desc: "Gives a user's Hypixel rank as a role when they verify.",
        short: "RankRole",
        db: "rank_role"
    },
    "dmverify": {
        desc: "DM a user when they're sucessfully verified",
        short: "DMVerify",
        db: "dm_verify"
    },
    "dmunverify": {
        desc: "DM a user when they're sucessfully unverified",
        short: "DMUnverify",
        db: "dm_unverify"
    },
    "allowunverify": {
        desc: "Let a user unverify themselves",
        short: "AllowUnverify",
        db: "allow_unverify"
    }
}

module.exports = {
    name: 'settings',
    alias: ['set', 's'],
    description: 'View and change the bot\'s settings',
    cat: 'config',
    async execute(message, args, client, prefix) {
        let setChangenick = db.get(`${message.guild.id}.change_nick`);
        let giveRankRole = db.get(`${message.guild.id}.rank_role`);
        let dmVerify = db.get(`${message.guild.id}.dm_verify`);
        let dmUnverify = db.get(`${message.guild.id}.dm_unverify`);
        let allowUnverify = db.get(`${message.guild.id}.allow_unverify`);

        let currentval = {
            'changenick': setChangenick,
            'rankrole': giveRankRole
        }

        if (!message.member.hasPermission('MANAGE_ROLES')) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(
                    `${e.x} **You don't have permission to use this command**\n` +
                    `${e.bunk} You need the **Manage Roles** permission to use this command.`
                )

            return message.channel.send(embed);
        }

        if (args.length == 0) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.green)
                .setDescription(
                    `**⚙️ Server Settings:**\n` +
                    `${e.bunk} ${(setChangenick == true || setChangenick == null) ? e.check : e.x} ChangeNick ➖ Change nickname to IGN when verified\n` +
                    `${e.bunk} ${(dmVerify == true) ? e.check : e.x} DMVerify ➖ DM a user when they're successfully verified\n` +
                    `${e.bunk} ${(dmUnverify == true) ? e.check : e.x} DMUnverify ➖ DM a user when they're successfully unverified\n` +
                    `${e.bunk} ${(allowUnverify == true || allowUnverify == null || allowUnverify == undefined) ? e.check : e.x} AllowUnverify ➖ Let a user unverify themselves\n` +
                    `${e.bunk} ${(giveRankRole || giveRankRole == null) ? e.check : e.x} RankRole ➖ Give hypixel rank as a role when user is verified\n\n` +
                    `${e.bunk} **Bot Prefix**: \`${prefix}\`\n` +
                    `${e.bunk} (configure using \`${prefix}prefix\`)\n\n` +
                    `*To change a setting:*\n` +
                    `${e.bunk} \`${prefix}settings [setting name] [true/false]\`\n` +
                    `${e.bunk} \`${prefix}settings ChangeNick false\``
                )

            message.channel.send(embed);
        } else if (args.length == 1) {
            let val = args[0].toLowerCase();

            if (dict[val] == undefined) {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **Couldn't find that setting**\n${e.bunk} *Use \`${prefix}settings\` for a full list of values*`)
                message.channel.send(embed);
            } else {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `⚙️ **Setting**: ${dict[val].short}\n` +
                        `${e.bunk} **Description**: ${dict[val].desc}\n` +
                        `${e.bunk} **Value**: ${(currentval[val] || currentval[val] == null) ? e.check + ' On' : e.x + ' Off'}\n` +
                        `\n*${e.bunk} To change this value, run \`${prefix}settings ${val} [true/false]\`*\n` +
                        `${e.bunk} *Use \`${prefix}settings\` for a full list of values*`
                    )
                message.channel.send(embed);
            }
        } else if (args.length == 2) {
            let val = args[0].toLowerCase();

            if (dict[val] == undefined) {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **Couldn't find that setting**\n${e.bunk} *Use \`${prefix}settings\` for a full list of values*`)
                message.channel.send(embed);
            } else {
                let n = args[1];
                if (n == 'true' || n == 't' || n == 'yes' || n == 'y' || n == 'on') {
                    await db.set(`${message.guild.id}.${dict[val].db}`, true);
                } else if (n == 'false' || n == 'f' || n == 'no' || n == 'n' || 'off') {
                    await db.set(`${message.guild.id}.${dict[val].db}`, false);
                } else {
                    const embed = new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(
                            `${e.x} **Invalid Settings Value**\n` +
                            `${e.bunk} The options are only \`true\` or \`false\`\n\n` +
                            `\`${prefix}settings ${args[0]} true\`\n` +
                            `\`${prefix}settings ${args[0]} false\``
                        )
                    return message.channel.send(embed);
                }

                let newdbval = db.get(`${message.guild.id}.${dict[val].db}`);
                const embed = new Discord.MessageEmbed()
                    .setColor(e.green)
                    .setDescription(
                        `⚙️ **Setting Updated**: ${dict[val].short}\n` +
                        `${e.bunk} **New value**: ${(newdbval || newdbval == null) ? e.check + ' On' : e.x + ' Off'}\n` +
                        `\n*${e.bunk} To change this value, run \`${prefix}settings ${val} [true/false]\`*\n` +
                        `${e.bunk} *Use \`${prefix}settings\` for a full list of values*`
                    )
                message.channel.send(embed);
            }
        }
    },
};