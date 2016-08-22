"use strict";
class User {
    constructor(nick) {
        this._nick = nick || "Anonymous";
        this._id = User.guid();
        this.channels = []
    }

    get nick() {
        return this._nick;
    }

    get id() {
        return this._id;
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
        let user = new User(other.nick);
        user._id = other.id;
        user.channels = other.channels.slice();
        return user;
    }
}

module.exports = User;
