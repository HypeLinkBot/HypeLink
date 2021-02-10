const db = require('quick.db');
const consola = require('consola');
const Discord = require('discord.js');
const e = require('../embeds.json');

module.exports = {
    name: 'prefix',
    description: 'View and change the bot\'s prefix',
    cat: 'settings',
    alias: ['pre'],
    guild: true,
    execute(message, args, client, prefix) {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            const embed = new Discord.MessageEmbed()
                .setColor(e.red)
                .setDescription(`${e.x} You need the **Manage Server** permission to use this command.`);
            message.channel.send(embed).then((newmsg) => {
                newmsg.delete({ timeout: 7000 }).catch();
            });
            return;
        }

        if (args.length == 0) {
            let text = `The current prefix for this guild is: \`${prefix}\`\nUse \`${prefix}${this.name} [new prefix]\` to change the prefix.\n\n*(You can also mention the bot instead of using the prefix)*`;

            const embed = new Discord.MessageEmbed()
                .setDescription(text)
                .setColor('GRAY');
            return message.channel.send(embed);
        }

        let newprefix = args.join(' ');
        db.set(`${message.guild.id}.prefix`, newprefix);
        consola.info(`Prefix for ${message.guild.name} (${message.guild.id}) changed to "${newprefix}"`);

        const embed = new Discord.MessageEmbed()
            .setColor(e.green)
            .setDescription(e.check + ` Successfully changed prefix to \`${newprefix}\``);
        message.channel.send(embed)
        return;
    },
};