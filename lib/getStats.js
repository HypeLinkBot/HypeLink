const grab = require('node-fetch');
const consola = require('consola');
const getRank = require('./convertRank.js');
const key = require('../config.json').hypixel_key;

const rawData = async (username, callback) => {
    let response = await grab(`https://api.hypixel.net/player?key=${key}&name=${username}`)
    response = await response.json();

    callback(response);
}

const getMojangUID = async (username) => {
    let notFound = false;
    let response = await grab('https://api.mojang.com/users/profiles/minecraft/' + username)
        .catch(() => {
            notFound = true;
        })
    if (notFound) return null;
    try {
        response = await response.json();

        if (!response.id) console.log(response);
        return response.id;
    } catch (e) {
        return null;
    }
}

const getUser = async (username, fetchguild) => {
    let mojangUID = await getMojangUID(username);
    if (!mojangUID) {
        return ({
            error: true,
            errorMsg: "This player doesn't exist"
        })
    }

    let response = await grab(`https://api.hypixel.net/player?key=${key}&uuid=${mojangUID}`)
    response = await response.json();

    if (!response.success) {
        console.log(response);
        let reason = "Unknown error";

        if (response.cause == 'You have already looked up this name recently')
            reason = "Too many recent verification attempts";

        return ({
            error: true,
            errorMsg: reason
        });
    }

    if (!response.player) return ({
        error: true,
        errorMsg: "This user has never joined Hypixel"
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
                let discordLink = player.socialMedia.links.DISCORD
                returnObject.discord = discordLink;
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
