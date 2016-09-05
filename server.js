const version = 'v1.1.1'
const port = 8081

const express = require('express')
const favicon = require('serve-favicon')
const User = require('./app/models/User')
const Channel = require('./app/models/Channel')
const Store = require('./app/Store')

const bodyParser = require('body-parser')
const app = express()
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let store = new Store()

// API

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/api.html')
})

// Info

app.get('/info/', function(req, res) {
    res.send({ 'version':version })
})

// List users

app.get('/users/', function(req, res) {
    res.send(Object.keys(store.users).map(id => store.users[id].getPublicUser()))
})

// Register

app.post('/users/register/:nick/', function(req, res) {
    const user = new User(store.getAvailableNick(req.params.nick))
    store.addUser(user)
    res.send(user)
})

// Disconnect

app.delete('/user/:id/disconnect/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({ error: 'Unknown user ID' })
        return
    }
	Object.keys(user.channels).forEach(name => {
            notice({ type: 'channelLeave', nick: user.nick, channel: name })
            const channel = store.getChannel(name)
            if (!channel.keep && store.getUsersByChannel(channel.name).length == 1) {
                store.removeChannel(channel.name)
            }
    })
    store.removeUser(user.id)
    res.send({ 'version': version })
})

// Whois

app.get('/users/whois/:nick/', function(req, res) {
    const id = Object.keys(store.users).find(id => store.users[id].nick === req.params.nick)
	const user = store.getUser(id)
    if (user === undefined) {
        res.status(404).send({ 'error': 'Unknown nick' })
    }
    else {
        res.send(user.getPublicUser())
    }
})

// List channels

app.get('/channels/', function(req, res){
    res.send(Object.keys(store.channels))
})

// Join channel

app.put('/user/:id/channels/:channel/join/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({ error: 'Unknown user ID' })
        return
    }
    let channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        channel = new Channel(req.params.channel)
        store.addChannel(channel)
    }
    user.channels[channel.name] = channel
    notice({ type: 'channelJoin', nick: user.nick, channel: channel.name })
    res.send(store.getUsersByChannel(channel.name, true))
})

// Talk in channel

app.put('/user/:id/channels/:channel/say/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({ error: 'Unknown user ID' })
        return
    }
    let channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        channel = new Channel(req.params.channel)
        store.addChannel(channel)
    }

    if (user.channels[channel.name] === undefined) {
        user.channels[channel.name] = channel
    }
    const message = req.body.message

    notice({ type: 'channelMessage', nick: user.nick, channel: channel.name, message: message })
    res.send(user)
})

// Leave channel

app.delete('/user/:id/channels/:channel/leave/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({ error: 'Unknow user ID' })
        return
    }
    const channel = store.getChannel(req.params.channel)
    if (user.channels[channel.name] !== undefined)
    {
        delete user.channels[channel.name]
        if (channel !== undefined) {
            if (!channel.keep && store.getUsersByChannel(channel.name).length == 0) {
                store.removeChannel(channel.name)
            }
            notice({ type: 'channelLeave', nick: user.nick, channel: channel.name })
        }
    }
    else {
        res.send(404).send({ error: "Not in channel, can't leave." })
    }
    res.send(user)
})

// Send private message

app.put('/user/:id/message/:nick/', function(req, res) {
    const sender = store.getUser(req.params.id)
    const recipient = store.getUserByNick(req.params.nick)
    const message = req.body.message
    if (sender === undefined) {
        res.status(404).send({ error: 'Unknown user ID'})
        return
    }
    if (recipient === undefined) {
        res.status(404).send({ error: 'Unknown username'})
        return
    }
    
    notice({ type: 'privateMessage', sender: sender.nick, recipient: recipient.nick, message: message})
    res.send(recipient)
})

// Fetch notices

app.get('/user/:id/notices/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({ error: 'Unknown user ID' })
        return
    }
    user.update()
    const idlingUsers = store.getIdlingUsers()
	idlingUsers.forEach(user => {
        Object.keys(user.channels).forEach(channel => notice({ type: 'channelLeave', nick: user.nick, channel: channel }))
        store.removeUser(user.id)
    })
    res.send(user.notices)
    user.notices = []
})

// Notice

function notice(message) {
    message.time = new Date().toJSON()
    
    switch (message.type) {
        case 'channelJoin':
        case 'channelMessage':
        case 'channelLeave':
            const channel = store.getChannel(message.channel)
            if (channel !== undefined) {
                const users = store.getUsersByChannel(channel.name, false)
                users.forEach(user => user.notices.push(message))
            }
            break
        
        case 'privateMessage':
            const recipient = store.getUserByNick(message.recipient)
            if (recipient !== undefined) {
                recipient.notices.push(message)
            }
            break

        default:
    }
}

// Error handling

function error(req, res) {
     res.status(404).send({error: "Unknown route or method."})
	 console.log('ERROR accessing ' + req.method + ' ' + req.path)
}

app.get('*', error)
app.post('*', error)
app.put('*', error)
app.delete('*', error)

// Server listening

if (__filename == process.argv[1]) {
    console.info('Server started on port ' + port)
    app.listen(port)
} else {
    module.exports = app
    module.exports.reset = function() {
        store = new Store()
    }
}
