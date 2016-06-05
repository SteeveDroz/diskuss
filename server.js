var version = 'v0.1-alpha';
var port = 8081;

var app = require('express')();
var http = require('http').Server(app);
var User = require('./app/models/User').User;

var users = [];

// API

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/app/api.html');
});

// Info

app.get('/info', function(req, res) {
    res.send({ 'version':version });
});

// Register

app.post('/users/register/:nick', function(req, res) {
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
    console.log(users);
    console.log();
});

// Whois

app.get('/id/:id/users/whois/:nick', function(req, res) {
    var user = null;
    for (var i in users) {
        var oneUser = users[i];
        if (oneUser.nick == req.params.nick) {
            user = oneUser;
            break;
        }
    }
    if (user == null) {
        res.send({ 'error': 'Unknown nick.' });
    }
    else {
        if (user.id != req.params.id) {
            user = User.create(user);
            user.id = undefined;
        }
        res.send(user);
    }
    console.log(users);
});

// Error handling

app.get('*', function(req, res) {
    res.send({ 'error': 'Unknown route.' });
});

app.post('*', function(req, res) {
    res.send({ 'error': 'Unknown route.' }); 
});

// Server listening

http.listen(port, function() {
    console.log('Server started on port ' + port); 
});

