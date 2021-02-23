let savedowner;

function user(client) {
    const { owner } = require('../config.json');
    if (!savedowner)
        savedowner = client.users.cache.get(owner);

    return savedowner;
}

module.exports = user;