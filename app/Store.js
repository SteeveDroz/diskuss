class Store {
    constructor() {
        this.users = {};
        this.channels = {};
    }

    getUser(id) {
        return this.users[id];
    }

    getChannel(id) {
        return this.channels[id];
    }

    getUsersByChannel(channel, removeId) {
        removeId = removeId === undefined ? true : removeId;

        let users = [];
        for(var id in this.users) {
            if (this.users[id].channels[channel.name] !== undefined) {
                users.push(this.users[id])
            }
        }
        if (removeId) {
            return users.map(user => user.getPublicUser())
        }
        return users

    }

    addUser(user) {
        this.users[user.id] = user;
        return this;
    }

    addChannel(channel) {
        this.channels[channel.name] = channel;
        return this;
    }
}

module.exports = Store;
