"use strict"

const Channel = require('./Channel')

class User {
    constructor(nick) {
        this.nick = nick || "Anonymous"
        this.id = User.guid()
        this.channels = {}
        this.notices = []
        this.lastSeen = Date.now()
    }

    static guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
    }

    static copy(other) {
        const user = new User(other.nick)
        user.id = other.id
        user.channels = {}
        for(let name in other.channels) {
            user.channels[name] = other.channels[name]
        }
        return user
    }
    
    isInChannel(channel) {
        return this.channels.indexOf(channel) >= 0
    }

    getPublicUser() {
        const publicUser = User.copy(this)
        publicUser.id = undefined
        publicUser.notices = []
        publicUser.lastSeen = undefined
        return publicUser
    }
    
    update() {
        this.lastSeen = Date.now()
    }
}

module.exports = User
