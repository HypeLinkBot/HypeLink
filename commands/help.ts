const Discord = require('discord.js');
const e = require('../embeds.json');
const owner = require('../owner.json');

module.exports = {
    name: 'help',
    description: 'Sends you a list of commands',
    cat: 'other',
    guild: false,
    alias: [],
    execute(message, args, client, prefix) {
        const invite = new Discord.MessageEmbed()
            .setColor('#ff85e4')
            .setTitle('HypeLink Commands')
            .setThumbnail('https://bonk.ml/circle_256.png?new')
            .setDescription(
                `[] = Required, () = Optional`
            )
            .addField(
                '\`Verification\`',
                `\`${prefix}verify [username]\` - Verify yourself as username\n` +
                `\`${prefix}guide\` - Shows steps on how to verify\n\n` +
                `\`${prefix}unverify\` - Unverifies you\n`
            )
            .addField(
                '\`General\`',
                `\`${prefix}me\` - Shows stat websites & name change history for you\n` +
                `\`${prefix}user [username]\` - Shows stat websites & name change history for a given username`
            )
            .addField(
                '\`Settings\`',
                `\`${prefix}settings\` - Configure server settings\n` +
                `\`${prefix}setrole\` - Configure role set up\n` +
                `\`${prefix}createroles\` - Automatically create the missing roles\n` +
                `\`${prefix}prefix\` - Change the bot's prefix. (Default: \`!\`)\n`
            )
            .addField(
                '\`Bot Related\`',
                `\`${prefix}invite\` - Gives you the bot's invite link\n` +
                `\`${prefix}donate\` - ⭐ Gives you the bot's donation link\n` +
                `\`${prefix}github\` - Gives you the bot's GitHub link\n` +
                `\`${prefix}stats\` - Shows lifetime stats for the bot\n` +
                `\`${prefix}report [problem]\` - Report a user or problem with the bot\n` +
                `\`${prefix}support\` - Gives you the bot's support server\n` +
                `\`${prefix}suggest [suggestion]\` - Suggest a feature for the bot\n`
            )
            .setFooter(
                `Bot by ${owner.tag} - https://bonk.ml/`,
                owner.avatarURL
            )

        if (message.guild) {
            message.author.send(invite).then(() => {
                message.react('✅');
            }).catch(() => {
                const embed = new Discord.MessageEmbed()
                    .setColor(e.red)
                    .setDescription(`${e.x} **Please enable DMs from server members.**`);

                message.channel.send(embed).then(newmsg => {
                    newmsg.delete({ timeout: 10000 }).catch();
                }).catch();
            });
        } else {
            message.author.send(invite).catch();
        }
    },
};