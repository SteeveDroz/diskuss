class User {
    constructor(nick) {
        this.nick = nick || "Anonymous";
        this.id = User.guid();
        this.channels = [];
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
        user.channels = other.channels.slice();
        return user;
    }

    isInChannel(channel) {
        return this.channels.indexOf(channel) >= 0;
    }
}

module.exports = User;
