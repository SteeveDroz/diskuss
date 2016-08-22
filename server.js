"use strict";

const version = 'v0.2-alpha';
const port = 8081;

const express = require('express');
const favicon = require('serve-favicon');
const User = require('./app/models/User');
const Channel = require('./app/models/Channel');

const bodyParser = require('body-parser');
const app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

var users = [];
var channels = [];

function findUser(id) {
	const findUserById = function(user) {
		if (user.id === id) {
			return user;
		}
	}
	return users.find(findUserById);
}

function findChannel(name) {
    for (let i in channels) {
        const channel = channels[i];
        if (channel.name == name) {
            return channel;
        }
    }
    const channel = new Channel(name);
    channels.push(channel);
    return channel;
}

function findUsersInChannel(name) {
	const findChannelByName = function(channel) {
		if (channel.name === name) {
			return channel;
		}
	}
	
	const findUsersInChannelByName = function(user) {
		
		if (user.channels.find(findChannelByName)) {
			return user;
		}
	}
	return users.filter(findUsersInChannelByName);
}

function notice(json) {
	let usersInChannel;
	switch (json.type) {
		case 'channelMessage':
			usersInChannel = findUsersInChannel(json.channel);
			for (let i in usersInChannel) {
				const userInChannel = usersInChannel[i];
				userInChannel.notices.push(json);
			}
			break;
			
		case 'channelJoin':
			usersInChannel = findUsersInChannel(json.channel);
			for (let i in usersInChannel) {
				const userInChannel = usersInChannel[i];
				if (userInChannel.nick != json.user) {
					userInChannel.notices.push(json);
				}
			}
			break;
		
		default:
	}
}

// API

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/api.html');
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
    const displayedUsers = [];
    for (let i in users) {
        const user = new User(users[i]);
        user.id = undefined;
        displayedUsers.push(user);
    }
    res.send(displayedUsers);
    console.log('* User list requested');
});

// Register

app.post('/users/register/:nick/', function(req, res) {
    const availableNick = req.params.nick;
    let nick = null;
    let index = 0;
    do {
        let available = true;
        for (let i in users) {
            const user = users[i];
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
    
    const user = new User(nick);
    users.push(user);
    res.send(user);
    console.log('* ' + user.nick + ' is connected');
});

// Disconnect

app.delete('/id/:id/disconnect/', function(req, res) {
	const user = findUser(req.params.id);
	for (let i in users) {
		const connectedUser = users[i];
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
    let user = null;
    for (let i in users) {
        const oneUser = users[i];
        if (oneUser.nick == req.params.nick) {
            user = User.copy(oneUser);
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
    console.log('* Whois on ' + req.params.nick);
});

// List channels

app.get('/channels/', function(req, res){
    res.send(channels);
    console.log('* Channel list requested');
});

// Join channel

app.put('/id/:id/channels/:channel/join/', function(req, res) {
    const user = findUser(req.params.id);
    const channel = findChannel(req.params.channel);
    user.channels.push(channel);
    res.send(findUsersInChannel(channel.name));
	notice({ 'type': 'channelJoin', 'user': user.nick, 'channel': channel.name });
    console.log('* ' + user.nick + ' joined ' + channel.name);
});

// Leave channel

app.delete('/id/:id/channels/:channel/leave/', function(req, res) {
    const user = findUser(req.params.id);
    const channel = findChannel(req.params.channel);
    const index = user.channels.indexOf(channel);
    if (index > -1)
    {
        user.channels.splice(index, 1);
        if (!channel.keep && findUsersInChannel(channel.name).length == 0) {
            //var index = channels.indexOf(channel);
            if (index > -1) {
                channels.splice(index, 1);
            }
        }
        console.log('* ' + user.nick + ' left ' + channel.name);
    }
    else {
        res.send(400).send({ error: "Not in channel, can't leave." });
    }
    res.send(user);
});

// Talk in channel

app.put('/id/:id/channels/:channel/say/', function(req, res) {
    const user = findUser(req.params.id);
    const channel = findChannel(req.params.channel);
    const message = req.body.message;
    
    if (!user.isInChannel(channel.name)) {
        user.channels.push(channel);
    }
    
	notice({ 'type': 'channelMessage', 'user': user.nick, 'channel': channel.name, 'message': message });
    res.send(user);
    console.log('<' + user.nick + '> ' + message);
});

// Get notices

app.get('/id/:id/notices', function(req, res) {
	const user = findUser(req.params.id);
	res.send(user.notices);
	user.notices = [];
	console.log("* Notices fetched.");
});

// Error handling

function error(req, res) {
     res.status(404).send({error: "Unknown route or method."});
}

app.get('*', error);
app.post('*', error);
app.put('*', error);
app.delete('*', error);

// Server listening

console.info('Server started on port ' + port);
app.listen(port)
