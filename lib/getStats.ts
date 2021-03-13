const grab = require('node-fetch');
const consola = require('consola');
const getRank = require('./convertRank.ts');
const key = require('../config.json').hypixel_key;

const rawData = async (username, callback) => {
    let response = await grab(`https://api.hypixel.net/player?key=${key}&name=${username}`)
    response = await response.json();

    callback(response);
}

const getUser = async (username, fetchguild) => {
    let response = await grab(`https://api.hypixel.net/player?key=${key}&name=${username}`)
    response = await response.json();

    if (!response.success) return ({
            error: true,
            errorMsg: "Unknown error"
        });

    if (!response.player) return ({
        error: true,
        errorMsg: "Player has never logged on to Hypixel"
    })

    const player = response.player;
    let returnObject = {
        name: player.displayname,
        exp: player.networkExp,
        discord: 'None Set#0000',
        uuid: player.uuid,
        guild: null,
        rank: getRank(player)
    }

    if (player.socialMedia !== undefined) {
        if (player.socialMedia.links !== undefined) {
            if (player.socialMedia.links.DISCORD !== undefined) {
                returnObject.discord = player.socialMedia.links.DISCORD;
            }
        }
    }

    if (!fetchguild) return returnObject;

    let guildData = await grab(`https://api.hypixel.net/guild?key=${key}&player=${player.uuid}`);
    guildData = await guildData.json();

    if (guildData) {
        if (guildData.guild && guildData.success) {
            guildData = guildData.guild;

            let guildObj = {
                name: guildData.name,
                id: guildData['_id'],
                rank: 'Member'
            }

            if (guildData.members !== undefined) {
                guildData.members.forEach(member => {
                    if (member.uuid == player.uuid)
                        return guildObj.rank = member.rank;
                })

                returnObject.guild = guildObj;
            }
        }
    }

    return returnObject;
}

module.exports = {
    getUser
}