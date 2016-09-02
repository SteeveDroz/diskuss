"use strict"

const User = require('./User')

class Channel {
    constructor(name) {
        this.name = name
        this.description = name
        this.keep = false
    }

    static copy(other) {
        const channel = new Channel(other.nick)
        channel.description = other.description
        channel.keep = other.keep
        return channel
    }
}

module.exports = Channel
