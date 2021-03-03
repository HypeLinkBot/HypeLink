const grab = require('node-fetch');
const consola = require('consola');
const getRank = require('./convertRank.ts');
const key = require('../config.json').hypixel_key;

const rawData = async (username, callback) => {
    let response = await grab(`https://api.hypixel.net/player?key=${key}&name=${username}`)
    response = await response.json();

    callback(response);
}

const getUser = async (username) => {
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

    let guildData = await grab(`https://api.slothpixel.me/api/guilds/${player.displayname}`);
    guildData = await guildData.json();

    if (guildData) {
        if (guildData.error) return;

        let guildObj = {
            name: guildData.name,
            id: guildData.id,
            rank: "Member"
        }

        if (guildData.members !== null) {
            guildData.members.forEach(member => {
                if (member.uuid == player.uuid)
                    return guildObj.rank = member.rank;
            })

            returnObject.guild = guildObj;
        }
    }

    return returnObject;
}

module.exports = {
    getUser
}