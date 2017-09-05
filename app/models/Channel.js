"use strict"

const User = require('./User')

class Channel {
    constructor(name, owner) {
        this.name = name
        this.description = name
        this.keep = false
        this.owner = owner
        this.banned = []
    }

    isBanned(user) {
        let banned = false
        this.banned.forEach(function(nick) {
            if (nick == user.nick) {
                banned = true
            }
        })
        return banned
    }

    static copy(other) {
        const channel = new Channel(other.name, other.owner)
        channel.description = other.description
        channel.keep = other.keep
        channel.banned = other.banned
        return channel
    }
}

module.exports = Channel
