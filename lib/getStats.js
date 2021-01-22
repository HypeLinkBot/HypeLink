const request = require('request');
const consola = require('consola');
const getRank = require('./getRank');
const key = require('../config.json').hypixel_key;

function rawData(username, callback) {
    request(`https://api.hypixel.net/player?key=${key}&name=${username}`, (err, response, body) => {
        callback(body);
    })
}

function formatted(username, callback) {
    request(`https://api.hypixel.net/player?key=${key}&name=${username}`, (err, response, body) => {
        //consola.info(`Fetching info for "${username}"`);
        if (err) {
            callback({
                "error": true,
                "errorMsg": err
            })
            return;
        }

        const output = JSON.parse(body);

        if (output.success !== true) {
            callback({
                "error": true,
                "errorMsg": "An unknown error occurred, try again in a couple of minutes."
            })
            return;
        }

        if (output.player == null) {
            callback({
                "error": true,
                "errorMsg": "This user has never logged on to Hypixel."
            })
            return;
        }

        let player = output.player;
        let discord = null;

        if (player.socialMedia !== undefined) {
            if (player.socialMedia.links !== undefined) {
                if (player.socialMedia.links.DISCORD !== undefined) {
                    discord = player.socialMedia.links.DISCORD;
                }
            }
        }

        let complete = {
            name: player.displayname,
            exp: player.networkExp,
            discord,
            uuid: player.uuid,
            rank: getRank(player)
        }

        //consola.success(`Fetched info for "${player.displayname}"`);
        callback(complete);
        return;
    })
}

module.exports = {
    raw: rawData,
    form: formatted
}