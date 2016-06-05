var User = function(nick) {
    this.nick = nick;
    this.id = guid();
    this.channels = []
    
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }
}

User.create = function(json){
    var user = new User();
    user.nick = json.nick;
    user.id = json.id;
    user.channels = json.channels;
    return user;
}

exports.User = User;

