function user(client) {
    const { owner } = require('../config.json');
    return client.users.cache.get(owner);
}

module.exports = user;