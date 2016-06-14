var version = 'v0.1-alpha';
var port = 8081;

var app = require('express')();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var User = require('./app/models/User').User;
var Channel = require('./app/models/Channel').Channel;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var users = [];
var channels = [];

function findUser(id) {
    for (var i in users) {
        var user = users[i];
        if (user.id == id) {
            return user;
        }
    }
}

function findChannel(name) {
    for (var i in channels) {
        var channel = channels[i];
        if (channel.name == name) {
            return channel;
        }
    }
    channel = new Channel(name);
    channels.push(channel);
    return channel;
}

function findUsersInChannel(name) {
    var usersInChannel = [];
    for (var i in users) {
        var user = users[i];
        for (var j in user.channels) {
            var channel = user.channels[j];
            if (channel.name == name) {
                usersInChannel.push(user);
                break;
            }
        }
    }
    return usersInChannel;
}

function notice(json) {
	switch (json.type) {
		case 'channelMessage':
			var usersInChannel = findUsersInChannel(channel.name);
			for (var i in usersInChannel) {
				var userInChannel = usersInChannel[i];
				userInChannel.notices.push(json);
			}
			break;
		
		default:
	}
}

// API

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/app/api.html');
    console.log('# delivering API');
});

// Info

app.get('/info/', function(req, res) {
    res.send({ 'version':version });
    console.log('* Info requested');
	console.log('# Users:');
	console.log(users);
	console.log('# Channels:');
	console.log(channels);
});

// List users

app.get('/users/', function(req, res) {
    var displayedUsers = [];
    for (var i in users) {
        var user = User.create(users[i]);
        user.id = undefined;
        displayedUsers.push(user);
    }
    res.send(displayedUsers);
    console.log('* User list requested');
});

// Register

app.post('/users/register/:nick/', function(req, res) {
    var availableNick = req.params.nick;
    var nick = null;
    var index = 0;
    do {
        var available = true;
        for (var i in users) {
            var user = users[i];
            if (index == 0 && user.nick == availableNick){
                available = false;
                break;
            }
            if (user.nick == availableNick + '_' + index) {
                available = false;
                break;
            }
        }
        if (available) {
            nick = availableNick;
            if (index > 0) {
                nick += '_' + index;
            }
        }
        else {
            index++;
        }
    } while (nick == null);
    
    user = new User(nick);
    users.push(user);
    res.send(user);
    console.log('* ' + user.nick + ' is connected');
});

// Disconnect

app.delete('/id/:id/disconnect/', function(req, res) {
	var user = findUser(req.params.id);
	for (var i in users) {
		var connectedUser = users[i];
		if (connectedUser.id == user.id) {
			users.splice(i, 1);
			break;
		}
	}
	res.send({ 'version': version });
	console.log('* ' + user.nick + ' is disconnected');
});

// Whois

app.get('/users/whois/:nick/', function(req, res) {
    var user = null;
    for (var i in users) {
        var oneUser = users[i];
        if (oneUser.nick == req.params.nick) {
            user = User.create(oneUser);
            break;
        }
    }
    if (user == null) {
        res.send({ 'error': 'Unknown nick.' });
    }
    else {
        user.id = undefined;
        res.send(user);
    }
    console.log('* Whois on ' + user.nick);
});

// List channels

app.get('/channels/', function(req, res){
    res.send(channels);
    console.log('* Channel list requested');
});

// Join channel

app.put('/id/:id/channels/:channel/join/', function(req, res) {
    var user = findUser(req.params.id);
    var channel = findChannel(req.params.channel);
    user.channels.push(channel);
    res.send(findUsersInChannel(channel.name));
    console.log('* ' + user.nick + ' joined ' + channel.name);
});

// Leave channel

app.delete('/id/:id/channels/:channel/leave/', function(req, res) {
    var user = findUser(req.params.id);
    var channel = findChannel(req.params.channel);
    var index = user.channels.indexOf(channel);
    if (index > -1)
    {
        user.channels.splice(index, 1);
        if (!channel.keep && findUsersInChannel(channel.name).length == 0) {
            var index = channels.indexOf(channel);
            if (index > -1) {
                channels.splice(index, 1);
            }
        }
        console.log('* ' + user.nick + ' left ' + channel.name);
    }
    else {
        res.send({ 'error': 'Not in channel, can\'t leave.' });
    }
    res.send(user);
});

// Talk in channel

app.put('/id/:id/channels/:channel/say/', function(req, res) {
    var user = findUser(req.params.id);
    var channel = findChannel(req.params.channel);
    var message = req.body.message;
    
    if (!user.isInChannel(channel.name)) {
        user.channels.put(channel);
    }
    
	notice({ 'type': 'channelMessage', 'user': user.nick, 'channel': channel.name, 'message': message });
    res.send(user);
    console.log('<' + user.nick + '> ' + message);
});

// Get notices

app.get('/id/:id/notices', function(req, res) {
	var user = findUser(req.params.id);
	res.send(user.notices);
	user.notices = [];
	console.log("* Notices fetched.");
});

// Error handling

app.get('*', function(req, res) {
    res.send({ 'error': 'Unknown route or method.' });
    console.log('# Unknown route: GET ' + req.baseUrl);
});

app.post('*', function(req, res) {
    res.send({ 'error': 'Unknown route or method.' }); 
    console.log('# Unknown route: POST ' + req.baseUrl);
});

app.put('*', function(req, res) {
    res.send({ 'error': 'Unknown route or method.' }); 
    console.log('# Unknown route: PUT ' + req.baseUrl);
});

app.delete('*', function(req, res) {
    res.send({ 'error': 'Unknown route or method.' }); 
    console.log('# Unknown route: DELETE ' + req.baseUrl);
});

// Server listening

http.listen(port, function() {
    console.log('Server started on port ' + port); 
});
