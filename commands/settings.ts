const db = require('quick.db');
const Discord = require('discord.js');
const e = require('../embeds.json');

const validateDefault = (settingValue) => {
    const validYes = [
        'yes',
        'y',
        'true',
        'on',
        'enable'
    ]

    const validNo = [
        'no',
        'n',
        'false',
        'off',
        'disable'
    ]

    if (validYes.indexOf(settingValue) > -1) return true;
    else if (validNo.indexOf(settingValue) > -1) return false;
    return null;
}

const validateRole = (guild, role) => {
    let roleID = role;

    if (roleID.indexOf('<@&') > -1) {
        roleID = roleID.split('<@&')[1];
        roleID = roleID.slice(0, -1)
    }

    const actualRole = guild.roles.cache.get(roleID);

    if (!actualRole) return false;
    return actualRole.id;
}

const getInfoForSetting = (guildID, settingName) => {
    let finalSettings = {
        dbval: undefined,
        currentVal: undefined,
        desc: undefined,
        fancy: undefined,
        default: undefined
    };

    switch (settingName) {
        case 'changenick':
            finalSettings.dbval = 'change_nick';
            finalSettings.desc = `Changes a user's nickname to their IGN once they verify.`;
            finalSettings.fancy = `ChangeNick`;
            finalSettings.default = true;
            break;
        case 'rankrole':
            finalSettings.dbval = 'rank_role';
            finalSettings.desc = `Gives a user their Hypixel rank role once they're verified.`;
            finalSettings.fancy = `RankRole`;
            finalSettings.default = true;
            break;
        case 'dmverify':
            finalSettings.dbval = 'dm_verify'
            finalSettings.desc = `DMs a user once they've successfully verified.`;
            finalSettings.fancy = `DMVerify`;
            finalSettings.default = false;
            break;
        case 'dmunverify':
            finalSettings.dbval = 'dm_unverify';
            finalSettings.desc = `DMs a user once they've successfully unverified.`;
            finalSettings.fancy = `DMUnverify`;
            finalSettings.default = false;
            break;
        case 'allowunverify':
            finalSettings.dbval = 'allow_unverify';
            finalSettings.desc = `Let users unverify in your server.`;
            finalSettings.fancy = `AllowUnverify`;
            finalSettings.default = true;
            break;
        case 'removeroleonverify':
            finalSettings.dbval = 'remove_verify';
            finalSettings.desc = `Remove a role once a server is verified.`;
            finalSettings.fancy = `RemoveRoleOnVerify`;
            finalSettings.default = false;
            break;
        default:
            return null;
    }

    finalSettings.currentVal = db.get(`${guildID}.${finalSettings.dbval}`);
    return finalSettings;
}

const updateSetting = (guild, settingName, newValue, client) => {
    switch (settingName) {
        case 'changenick':
        case 'rankrole':
        case 'dmverify':
        case 'dmunverify':
        case 'allowunverify':
            let validated = validateDefault(newValue);
            let settingValue = getInfoForSetting(guild.id, settingName);
            if (validated == null) {
                return false;
            }

            db.set(`${guild.id}.${settingValue.dbval}`, validated);
            return true;
        case 'removeroleonverify':
            let validatedRole = validateRole(guild, newValue);
            let currSettingValue = getInfoForSetting(guild.id, settingName);

            db.set(`${guild.id}.${currSettingValue.dbval}`, validatedRole);
            return true;
    }
    return false;
}

module.exports = {
    name: 'settings',
    alias: ['set', 's'],
    description: 'View and change the bot\'s settings',
    cat: 'config',
    guild: true,
    async execute(message, args, client, prefix) {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(
                        `${e.x} **You don't have permission to use this command.**\n` +
                        `You need the \`Manage Guild\` permission :sob:.`
                    )
            ).then(newMessage => {
                newMessage.delete({
                    timeout: 10000
                }).catch()
            }).catch();
        }

        const gi = settingName => {
            const infoForSetting = getInfoForSetting(message.guild.id, settingName);

            let currentValue = infoForSetting.currentVal;
            if (currentValue == null) currentValue = infoForSetting.default;
            if (typeof currentValue == 'string') currentValue = `<@&${currentValue}>`;
            if (currentValue == true) currentValue = ':white_check_mark: On';
            if (currentValue == false) currentValue = ':x: Off';

            return currentValue;
        }

        if (args.length == 0) {
            const settingValues = [
                `${gi('changenick')} ☆ \`ChangeNick\` ☆ Changes a user's nickname as their IGN.`,
                `${gi('rankrole')} ☆ \`RankRole\` ☆ Gives a user their Hypixel rank once they're verified.`,
                `${gi('dmverify')} ☆ \`DMVerify\` ☆ DMs a user once they're verified.`,
                `${gi('dmunverify')} ☆ \`DMUnverify\` ☆ DMs a user once they're unverified.`,
                `${gi('allowunverify')} ☆ \`AllowUnverify\` ☆ Allow a user to unverify themselves.`,
                ``,
                `${gi('removeroleonverify')} ☆ \`RemoveRoleOnVerify\` ☆ Remove a role once a user is verified`,
                ``,
                `<:role:808826577785716756> **Role Configuration**`,
                `Use \`${prefix}setroles\` to setup this server's Hypixel rank and verified roles.`
            ]

            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.default)
                    .setDescription(
                        `<:settings:585767366743293952> **Current Settings**\n` +
                        settingValues.join('\n')
                    )
            ).catch();
        } else if (args.length == 1) {
            let settingName = args[0].toLowerCase();
            let settingValues = getInfoForSetting(message.guild.id, settingName);

            if (!settingValues) {
                return message.channel.send(
                    new Discord.MessageEmbed()
                        .setColor(e.red)
                        .setDescription(
                            `${e.x} **This setting doesn't exist**.\n` +
                            `Use \`${prefix}settings\` for a list of settings.`
                        )
                ).catch();
            }

            let currentValue = settingValues.currentVal;
            if (currentValue == null) currentValue = settingValues.default;
            if (typeof currentValue == 'string') currentValue = `<@&${currentValue}>`;
            if (currentValue == true) currentValue = ':white_check_mark: On';
            if (currentValue == false) currentValue = ':x: Off';

            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.default)
                    .setDescription(
                        `:flushed: **\`${settingValues.fancy}\`**\n` +
                        `${settingValues.desc}\n\n` +
                        `**Current Value**: ${currentValue}`
                    )
            ).catch();
        }

        const settingName = args[0].toLowerCase();
        const newSettingValue = args[1];
        const settingUpdate = updateSetting(message.guild, settingName, newSettingValue, client);

        if (settingUpdate) {
            const settingInfo = getInfoForSetting(message.guild.id, settingName);
            const newSettingValue = gi(settingName);

            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(e.green)
                    .setDescription(
                        `${e.check} **\`${settingInfo.fancy}\`** was updated\n\n` +
                        `**New value**: ${newSettingValue}`
                    )
            ).catch();
        }

        return message.channel.send(
            new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(
                    `${e.x} **Invalid value** :sob:\n` +
                    `The value provided is invalid.`
                )
        ).catch();
    },
};