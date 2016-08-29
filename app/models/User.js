"use strict";

const Channel = require('./Channel');

class User {
    constructor(nick) {
        this.nick = nick || "Anonymous";
        this.id = User.guid();
        this.channels = {};
        this.notices = [];
    }

    static guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    static copy(other) {
        const user = new User(other.nick);
        user.id = other.id;
        user.channels = {}
        for(let name in other.channels) {
            user.channels[name] = other.channels[name]
        }
        return user;
    }

    static getAvailableNick(nick) {
        if (User.list[nick] == undefined) {
            return nick;
        }
        let suffix = 1;
        do {
            if (User.list[nick + '_' + suffix] == undefined)
            {
                break;
            }
            suffix++;
        } while (true);
        return nick + '_' + suffix;
    }

    isInChannel(channel) {
        return this.channels.indexOf(channel) >= 0;
    }

    getPublicUser() {
        const publicUser = User.copy(this);
        publicUser.id = undefined;
        publicUser.notices = [];
        return publicUser;
    }
}

const list = {};

module.exports = User;
module.exports.list = list;
