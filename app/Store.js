class Store {
    constructor() {
        this._users = {};
        this._channels = {};
    }
    
    get users() {
        return this._users;
    }
    
    get channels() {
        return this._channels;
    }

    getUser(id) {
        return this.users[id];
    }

    getChannel(name) {
        return this.channels[name];
    }

    getUsersByChannel(channel, removeId) {
        removeId = removeId === undefined ? true : removeId;

        let users = [];
        for(var id in this.users) {
            if (this.getUser(id).channels[channel.name] !== undefined) {
                users.push(this.users[id])
            }
        }
        if (removeId) {
            return this.users.map(user => user.getPublicUser())
        }
        return users
    }
    
    getAvailableNick(nick) {
        let id = Object.keys(this.users).find(id => this.getUser(id).nick === nick);
        if (id === undefined) {
            return nick;
        }
        let user = this.getUser(id);
        let suffix = 1;
        do {
            if (this.users.find(user => user.nick === nick + '_' + suffix) === undefined)
            {
                break;
            }
            suffix++;
        } while (true);
        return nick + '_' + suffix;
    }

    addUser(user) {
        this.users[user.id] = user;
        return this;
    }

    addChannel(channel) {
        this.channels[channel.name] = channel;
        return this;
    }
    
    removeUser(id) {
        delete this.users[id];
        return this;
    }
    
    removeChannel(name) {
        delete this.channels[name];
        return this;
    }
}

module.exports = Store;
