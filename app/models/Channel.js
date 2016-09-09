"use strict"

const User = require('./User')

class Channel {
    constructor(name, owner) {
        this.name = name
        this.description = name
        this.keep = false
        this.owner = owner
    }

    static copy(other) {
        const channel = new Channel(other.nick)
        channel.description = other.description
        channel.keep = other.keep
        return channel
    }
}

module.exports = Channel
