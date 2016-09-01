const version = 'v0.3-alpha';
const port = 8081;

const express = require('express');
const favicon = require('serve-favicon');
const User = require('./app/models/User');
const Channel = require('./app/models/Channel');
const Store = require('./app/Store');

const bodyParser = require('body-parser');
const app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

const store = new Store();

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
    console.log(store.users);
    console.log('# Channels:');
    console.log(store.channels);
});

// List users

app.get('/users/', function(req, res) {
    res.send(store.users.map(user => user.getPublicUser()));
    console.log('* User list requested');
});

// Register

app.post('/users/register/:nick/', function(req, res) {
    const user = new User(store.getAvailableNick(req.params.nick));
    store.addUser(user);
    res.send(user);
    console.log('* ' + user.nick + ' is connected');
});

// Disconnect

app.delete('/user/:id/disconnect/', function(req, res) {
    const user = store.getUser(req.params.id);
    if (user === undefined) {
        res.status(404).send({ error: 'Unknow user ID' })
        return
    }
    store.removeUser(user.id);
    res.send({ 'version': version });
    console.log('* ' + user.nick + ' is disconnected');
});

// Whois

app.get('/users/whois/:nick/', function(req, res) {
    const user = store.users.find(user => user.nick === req.params.nick);
    if (user === null) {
        res.send(400).send({ 'error': 'Unknown nick.' });
    }
    else {
        res.send(user.getPublicUser());
    }
    console.log('* Whois on ' + req.params.nick);
});

// List channels

app.get('/channels/', function(req, res){
    res.send(store.channels.map(channel => channel.name));
    console.log('* Channel list requested');
});

// Join channel

app.put('/user/:id/channels/:channel/join/', function(req, res) {
    const user = store.getUser(req.params.id);
    if (user === undefined) {
        res.status(404).send({ error: 'Unknown user ID' })
        return
    }
    let channel = store.getChannel(req.params.channel);
    if (channel === undefined) {
        channel = new Channel(req.params.channel);
        store.addChannel(channel);
    }
    user.channels[channel.name] = channel;
    notice({ type: 'channelJoin', nick: user.nick, channel: channel.name });
    res.send(user);
    console.log('* ' + user.nick + ' joined ' + channel.name);
});

// Talk in channel

app.put('/user/:id/channels/:channel/say/', function(req, res) {
    const user = store.getUser(req.params.id);
    if (user === undefined) {
        res.status(404).send({ error: 'Unknown user ID' })
        return
    }
    let channel = store.getChannel(req.params.channel);
    if (channel === undefined) {
        channel = new Channel(req.params.channel);
        Channel.list[channel.name] = channel;
    }

    if (user.channels[channel.name] === undefined) {
        user.channels[channel.name] = channel;
    }
    const message = req.body.message;

    notice({ type: 'channelMessage', nick: user.nick, channel: channel.name, message: message });
    res.send(user);
    console.log('<' + user.nick + '#' + channel.name + '> ' + message);
});

// Leave channel

app.delete('/user/:id/channels/:channel/leave/', function(req, res) {
    const user = store.getUser(req.params.id);
    if (user === undefined) {
        res.status(404).send({ error: 'Unknow user ID' })
        return
    }
    const channel = store.getChannel(req.params.channel);
    if (user.channels[channel.name] !== undefined)
    {
        delete user.channels[channel.name];
        if (channel !== undefined) {
            if (!channel.keep && channel.getUsers().length == 0) {
                store.removeChannel(channel.name);
            }
            notice({ type: 'channelLeave', nick: user.nick, channel: channel.name });
            console.log('* ' + user.nick + ' left ' + channel.name);
        }
    }
    else {
        res.send(400).send({ error: "Not in channel, can't leave." });
    }
    res.send(user);
});

// Fetch notices

app.get('/user/:id/notices/', function(req, res) {
    const user = store.getUser(req.params.id);
    if (user === undefined) {
        res.status(404).send({ error: 'Unknown user ID' })
        return
    }
    res.send(user.notices);
    user.notices = [];
    console.log("* Notices fetched.");
});

// Notice

function notice(message) {
    switch (message.type) {
        case 'channelJoin':
        case 'channelMessage':
        case 'channelLeave':
            const channel = store.getChannel(message.channel);
            const users = store.getUsersByChannel(channel, false);
            users.forEach(user => user.notices.push(message));
            break;

        default:
    }
}

// Error handling

function error(req, res) {
     res.status(404).send({error: "Unknown route or method."});
	 console.log('ERROR accessing ' + req.method + ' ' + req.path)
}

app.get('*', error);
app.post('*', error);
app.put('*', error);
app.delete('*', error);

// Server listening

if (__filename == process.argv[1]) {
    console.info('Server started on port ' + port);
    app.listen(port)
} else {
    module.exports = app;
    module.exports.reset = function() {
        store = new Store();
    }
}
