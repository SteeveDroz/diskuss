class Store {
    constructor() {
        this._users = {}
        this._channels = {}
    }
    
    get users() {
        return this._users
    }
    
    get channels() {
        return this._channels
    }

    getUser(id) {
        return this.users[id]
    }
    
    getUserByNick(nick) {
        return this.users[Object.keys(this.users).find(id => this.users[id].nick === nick)]
    }

    getChannel(name) {
        return this.channels[name]
    }

    getUsersByChannel(channel, removeId) {
        removeId = removeId === undefined ? true : removeId

        let users = []
        for(let id in this.users) {
            if (this.getUser(id).channels[channel] !== undefined) {
                users.push(this.getUser(id))
            }
        }
        if (removeId) {
            return users.map(user => user.getPublicUser())
        }
        return users
    }
    
    getAvailableNick(nick) {
        let id = Object.keys(this.users).find(id => this.getUser(id).nick === nick)
        if (id === undefined) {
            return nick
        }
        let user = this.getUser(id)
        let suffix = 1
        do {
            if (Object.keys(this.users).find(id => this.getUser(id).nick === nick + '_' + suffix) === undefined)
            {
                break
            }
            suffix++
        } while (true)
        return nick + '_' + suffix
    }
    
    getIdlingUsers() {
        return Object.keys(this.users).filter(id => this.users[id].lastSeen < Date.now() - 5000 /* 5 seconds */).map(id => this.users[id])
    }

    addUser(user) {
        this.users[user.id] = user
        return this
    }

    addChannel(channel) {
        this.channels[channel.name] = channel
        return this
    }
    
    removeUser(id) {
        delete this.users[id]
        return this
    }
    
    removeChannel(name) {
        delete this.channels[name]
        return this
    }
}

module.exports = Store
