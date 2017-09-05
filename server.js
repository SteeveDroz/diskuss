const version = require('./package.json').version
const port = 8081

const express = require('express')
const cors = require('cors')
const favicon = require('serve-favicon')
const User = require('./app/models/User')
const Channel = require('./app/models/Channel')
const Store = require('./app/Store')

const bodyParser = require('body-parser')
const app = express()

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(cors())
app.set('views', './public')
app.set('view engine', 'ejs')

let store = new Store()

// API

app.get('/', function(req, res) {
    res.render('api.ejs', {
        version: version
    })
})

// Info

app.get('/info/', function(req, res) {
    res.send({
        'version': version
    })
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
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    Object.keys(user.channels).forEach(name => {
        notice({
            type: 'channelLeave',
            nick: user.nick,
            channel: store.getChannel(name)
        })
        const channel = store.getChannel(name)
        if (!channel.keep && store.getUsersByChannel(channel.name).length == 1) {
            store.removeChannel(channel.name)
        }
    })
    store.removeUser(user.id)
    res.send({
        status: 'Successfully disconnected from the server'
    })
})

// Whois

app.get('/users/whois/:nick/', function(req, res) {
    const id = Object.keys(store.users).find(id => store.users[id].nick === req.params.nick)
    const user = store.getUser(id)
    if (user === undefined) {
        res.status(404).send({
            'error': 'Unknown nick'
        })
    } else {
        res.send(user.getPublicUser())
    }
})

// List channels

app.get('/channels/', function(req, res) {
    res.send(Object.keys(store.channels).map(name => store.channels[name]))
})

// Join channel

app.put('/user/:id/channels/:channel/join/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    let channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        channel = new Channel(req.params.channel, user.nick)
        store.addChannel(channel)
    }
    if (channel.isBanned(user)) {
        res.status(404).send({
            error: 'Unable to join, you have been banned'
        })
        return
    }
    user.channels[channel.name] = channel
    notice({
        type: 'channelJoin',
        nick: user.nick,
        channel: channel
    })
    res.send({
        channel: channel,
        users: store.getUsersByChannel(channel.name, true)
    })
})

// Talk in channel

app.put('/user/:id/channels/:channel/say/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
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

    notice({
        type: 'channelMessage',
        nick: user.nick,
        channel: channel,
        message: message
    })
    res.send({
        status: 'Message sent correctly',
        message: message
    })
})

// Change channel description

app.put('/user/:id/channels/:channel/description/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    const channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        res.status(404).send({
            error: 'Unknown channel'
        })
        return
    }
    const description = req.query.description
    if (description === undefined) {
        res.status(404).send({
            'error': 'Description cannot be null'
        })
    } else {
        channel.description = description

        notice({
            type: 'channelDescription',
            nick: user.nick,
            channel: channel
        })
        res.send({
            status: 'Changing the description',
            channel: channel
        })
    }
})

// Kick a user

app.delete('/user/:id/channels/:channel/kick/:nick/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    const channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        res.status(404).send({
            error: 'Unknown channel'
        })
        return
    }
    const kickedUser = store.getUserByNick(req.params.nick)
    if (kickedUser === undefined) {
        res.status(404).send({
            error: 'Unknown username'
        })
        return
    }
    if (channel.owner !== user.nick) {
        res.status(404).send({
            error: 'You don\'t own the channel'
        })
        return
    }
    if (kickedUser.channels[channel.name] !== undefined) {
        delete kickedUser.channels[channel.name]
        if (channel !== undefined) {
            notice({
                type: 'userKick',
                nick: kickedUser.nick,
                channel: channel
            })
        }
        res.send({
            status: 'User successfully kicked',
            user: kickedUser,
            channel: channel
        })
    } else {
        res.send(404).send({
            error: "Not in channel, can't be kicked."
        })
    }
})

// Ban a user

app.post('/user/:id/channels/:channel/ban/:nick/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    const channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        res.status(404).send({
            error: 'Unknown channel'
        })
        return
    }
    const bannedUser = store.getUserByNick(req.params.nick)
    if (bannedUser === undefined) {
        res.status(404).send({
            error: 'Unknown username'
        })
        return
    }

    channel.banned.push(bannedUser.nick)
    notice({
        type: 'userBan',
        nick: bannedUser.nick,
        channel: channel
    })
    res.send({
        status: 'User successfully banned',
        user: bannedUser,
        channel: channel
    })
})

// Unban a user

// Fetch channel informations

app.get('/channels/info/:name/', function(req, res) {
    const name = req.params.name
    const channel = store.getChannel(name)

    if (channel === undefined) {
        res.status(404).send({
            'error': 'Unknown channel'
        })
    } else {
        res.send({
            channel: channel
        });
    }
})

// Keep channel

app.put('/user/:id/channels/:channel/keep', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    const channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        res.status(404).send({
            error: 'Unknown channel'
        })
        return
    }
    if (channel.owner !== user.nick) {
        res.status(404).send({
            error: 'You don\'t own the channel'
        })
        return
    }
    const keep = req.body.keep

    channel.keep = keep == true

    if (!channel.keep && store.getUsersByChannel(channel.name).length == 0) {
        store.removeChannel(channel.name)
    }

    notice({
        type: 'channelKeep',
        nick: user.nick,
        channel: channel
    })
    res.send({
        status: 'Changing the persistence',
        channel: channel
    })
})

// Give channel ownership

app.put('/user/:id/channels/:channel/owner/:nick/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    const channel = store.getChannel(req.params.channel)
    if (channel === undefined) {
        res.status(404).send({
            error: 'Unknown channel'
        })
        return
    }
    const recipient = store.getUserByNick(req.params.nick)
    if (recipient === undefined) {
        res.status(404).send({
            error: 'Unknown username'
        })
        return
    }
    if (channel.owner !== user.nick) {
        res.status(404).send({
            error: 'You don\'t own the channel'
        })
        return
    }
    channel.owner = recipient.nick

    notice({
        type: 'channelOwner',
        channel: channel,
        nick: user.nick
    })
    res.send({
        status: 'Ownership transfered',
        channel: channel
    })
})

// Leave channel

app.delete('/user/:id/channels/:channel/leave/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknow user ID'
        })
        return
    }
    const channel = store.getChannel(req.params.channel)
    if (user.channels[channel.name] !== undefined) {
        delete user.channels[channel.name]
        if (channel !== undefined) {
            if (!channel.keep && store.getUsersByChannel(channel.name).length == 0) {
                store.removeChannel(channel.name)
            }
            notice({
                type: 'channelLeave',
                nick: user.nick,
                channel: channel
            })
        }
    } else {
        res.send(404).send({
            error: "Not in channel, can't leave."
        })
    }
    res.send({
        status: 'Leaving the channel',
        channel: channel
    })
})

// Send private message

app.put('/user/:id/message/:nick/', function(req, res) {
    const sender = store.getUser(req.params.id)
    const recipient = store.getUserByNick(req.params.nick)
    const message = req.body.message
    if (sender === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    if (recipient === undefined) {
        res.status(404).send({
            error: 'Unknown username'
        })
        return
    }

    notice({
        type: 'privateMessage',
        sender: sender.nick,
        recipient: recipient.nick,
        message: message
    })
    res.send({
        status: 'Private message sent correctly',
        message: message,
        recipient: recipient
    })
})

// Fetch notices

app.get('/user/:id/notices/', function(req, res) {
    const user = store.getUser(req.params.id)
    if (user === undefined) {
        res.status(404).send({
            error: 'Unknown user ID'
        })
        return
    }
    user.update()
    const idlingUsers = store.getIdlingUsers()
    idlingUsers.forEach(user => {
        Object.keys(user.channels).forEach(name => {
            notice({
                type: 'channelLeave',
                nick: user.nick,
                channel: user.channels[name]
            })
            if (store.getUsersByChannel(name).length == 1) {
                store.removeChannel(name)
            }
        })
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
        case 'channelDescription':
        case 'channelKeep':
        case 'userKick':
        case 'channelOwner':
            const channel = store.getChannel(message.channel.name)
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
    res.status(404).send({
        error: "Unknown route or method."
    })
    console.log('ERROR accessing ' + req.method + ' ' + req.path)
}

app.get('*', error)
app.post('*', error)
app.put('*', error)
app.delete('*', error)

// Server listening

if (__filename == process.argv[1]) {
    console.info('Diskuss v' + version + ' started on port ' + port)
    app.listen(port)
} else {
    module.exports = app
    module.exports.reset = function() {
        store = new Store()
    }
}
