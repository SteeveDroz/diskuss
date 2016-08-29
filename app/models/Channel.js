"use strict";

const User = require('./User');

class Channel {
    constructor(name) {
        this.name = name;
        this.description = name;
        this.keep = false;
    }

    static copy(other) {
        const channel = new Channel(other.nick);
        channel.description = other.description;
        channel.keep = other.keep;
        return channel;
    }
    
    //getUsers(removedId = true) { // TODO Default value in arguments did not work, temporarily using the old way.
    getUsers(removedId) {
        if (removedId === undefined) {
            removedId = true;
        }
        const users = User.list.filter(user => user.channels[this.name] != undefined);
        if (removedId) {
            return users.map(user => user.getPublicUser());
        }
        return users;
    }
}
Channel.list = {};

module.exports = Channel;
