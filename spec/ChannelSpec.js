const app = require('../server'),
    request = require('supertest')

describe('Valid app', function() {
    const agent = request.agent(app)
    let id
    it('connects to server', function(done){
        agent.post('/users/register/toto/')
			.end(function(err, res) {
				expect(200)
				id = res.body.id
				expect(id).not.toBeUndefined()
				done()
			})
    })
	
	it('asks who is a user', function(done) {
		agent.get('/users/whois/toto/')
			.end(function(err, res) {
				expect(200)
				const user = res.body
				expect(user).not.toBeUndefined()
				if (user !== undefined) {
					expect(user.nick).toBe('toto')
				}
				done()
			})
	})
    
    it('joins a channel', function(done) {
        agent.put('/user/' + id + '/channels/channel-1/join/')
            .end(function(err, res) {
                expect(200)
				const users = res.body
				expect(users).not.toBeUndefined()
				if (users !== undefined) {
					expect(users.length).toBe(1)
					if (users.length == 1) {
						expect(users[0].nick).toBe('toto')
					}
				}
				done()
            })
    })
    
    it('talks in channel', function(done) {
        agent.put('/user/' + id + '/channels/channel-1/say/')
            .send({ message: 'Hello, Channel 1!' })
            .end(function(err, res) {
                expect(200)
                const user = res.body
                expect(user).not.toBeUndefined()
                expect(user.id).toEqual(id)
				done()
            })
    })
    
    it('talks in another channel', function(done) {
        agent.put('/user/' + id + '/channels/channel-2/say/')
            .send({ message: 'Hello, Channel 2!' })
            .end(function(err, res) {
                expect(200)
                const user = res.body
                expect(user).not.toBeUndefined()
                expect(user.id).toEqual(id)
				done()
            })
    })
    
    it('sends a private message', function(done) {
        agent.put('/user/' + id + '/message/toto/')
            .send({ message: 'Private message' })
            .end(function(err, res) {
                expect(200)
                const user = res.body
                expect(user).not.toBeUndefined()
                expect(user.nick).toBe('toto')
                done()
            })
    })
    
    it('checks for notices', function(done) {
        agent.get('/user/' + id + '/notices/')
            .end(function(err, res) {
                expect(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                expect(notices.length).toEqual(4)
				if (notices.length == 4) {
                    expect(notices[0].type).toEqual('channelJoin')
                    expect(notices[0].nick).toEqual('toto')
                    expect(notices[0].channel).toEqual('channel-1')
                    expect(notices[0].time).not.toBeUndefined()
                    if (notices[0].time !== undefined) {
                        expect(notices[0].time.length).toBe(24)
                    }

                    expect(notices[1].type).toEqual('channelMessage')
                    expect(notices[1].nick).toEqual('toto')
                    expect(notices[1].channel).toEqual('channel-1')
                    expect(notices[1].message).toEqual('Hello, Channel 1!')
                    expect(notices[1].time).not.toBeUndefined()
                    if (notices[1].time !== undefined) {
                        expect(notices[1].time.length).toBe(24)
                    }

                    expect(notices[2].type).toEqual('channelMessage')
                    expect(notices[2].nick).toEqual('toto')
                    expect(notices[2].channel).toEqual('channel-2')
                    expect(notices[2].message).toEqual('Hello, Channel 2!')
                    expect(notices[2].time).not.toBeUndefined()
                    if (notices[2].time !== undefined) {
                        expect(notices[2].time.length).toBe(24)
                    }

                    expect(notices[3].type).toEqual('privateMessage')
                    expect(notices[3].sender).toEqual('toto')
                    expect(notices[3].recipient).toEqual('toto')
                    expect(notices[3].message).toEqual('Private message')
                    expect(notices[3].time).not.toBeUndefined()
                    if (notices[3].time !== undefined) {
                        expect(notices[3].time.length).toBe(24)
                    }
				}
				done()
            })
    })
    
    it('disconnects', function(done) {
        agent.del('/user/' + id + '/disconnect/')
            .end(function(err, res) {
                expect(200)
                const version = res.body.version
                expect(version).not.toBeUndefined()
				done()
            })
    })
})

describe('Invalid app', function() {
    const agent = request.agent(app)
    let id
    it('connects to server', function(done){
        agent.post('/users/register/toto/')
		.end(function(err, res) {
				expect(200)
				id = res.body.id
				expect(id).not.toBeUndefined()
				done()
			})
    })
    
	it('asks who is a user', function(done) {
		agent.get('/users/whois/nobody/')
			.end(function(err, res) {
				expect(404)
				const message = res.body
				expect(message).not.toBeUndefined()
				if (message !== undefined) {
					expect(message.error).toBe('Unknown nick')
				}
				done()
			})
	})
    
    it('joins a channel', function(done) {
        agent.put('/user/INVALID-ID/channels/channel-1/join/')
            .end(function(err, res) {
                expect(404)
                const message = res.body
                expect(message).not.toBeUndefined()
				if (message !== undefined) {
					expect(message.error).toEqual('Unknown user ID')
				}
				done()
            })
    })
    
    it('talks in channel', function(done) {
        agent.put('/user/INVALID-ID/channels/channel-1/say/')
            .send({ message: 'Hello, world!' })
            .end(function(err, res) {
                expect(404)
                const message = res.body
                expect(message).not.toBeUndefined()
				if (message !== undefined) {
					expect(message.error).toEqual('Unknown user ID')
				}
				done()
            })
    })
    
    it('sends a private message with wrong ID', function(done) {
        agent.put('/user/INVALID-ID/message/toto/')
            .send({ message: 'Private message 1' })
            .end(function(err, res) {
                expect(404)
                const message = res.body
                expect(message).not.toBeUndefined()
				if (message !== undefined) {
					expect(message.error).toEqual('Unknown user ID')
				}
                done()
            })
    })
    
    it('sends a private message to a non existing user', function(done) {
        agent.put('/user/' + id + '/message/foobar/')
            .send({ message: 'Private message 2' })
            .end(function(err, res) {
                expect(200)
                const message = res.body
                expect(message).not.toBeUndefined()
				if (message !== undefined) {
					expect(message.error).toEqual('Unknown username')
				}
                done()
            })
    })
    
    it('checks for notices with wrong ID', function(done) {
        agent.get('/user/INVALID-ID/notices/')
            .end(function(err, res) {
                expect(404)
                const message = res.body
                expect(message).not.toBeUndefined()
				expect(message.error).not.toBeUndefined()
				if (message.error !== undefined) {
					expect(message.error).toEqual('Unknown user ID')
				}
				done()
            })
    })
    
    it('checks for notices with good ID', function(done) {
        agent.get('/user/' + id + '/notices/')
            .end(function(err, res) {
                expect(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
				expect(notices.length).toBe(0)
				done()
            })
    })
    
    it('disconnects', function(done) {
        agent.del('/user/INVALID-ID/disconnect/')
            .end(function(err, res) {
                expect(404)
                const message = res.body
                expect(message).not.toBeUndefined()
				if (message !== undefined) {
					expect(message.error).toBe('Unknown user ID')
				}
				done()
            })
    })

    it('disconnects', function(done) {
        agent.del('/user/' + id + '/disconnect/')
            .end(function(err, res) {
                expect(200)
                const version = res.body.version
                expect(version).not.toBeUndefined()
				done()
            })
    })
})

describe('Multiuser app', function() {
	const agent = request.agent(app)
	let id1, id2
	
	it('connects the first user', function(done) {
		agent.post('/users/register/user1/')
			.end(function(err, res) {
				expect(200)
				id1 = res.body.id
				expect(id1).not.toBeUndefined()
				done()
			})
	})
	
	it('connects the second user', function(done) {
		agent.post('/users/register/user2/')
			.end(function(err, res) {
				expect(200)
				id2 = res.body.id
				expect(id2).not.toBeUndefined()
				done()
			})
	})
	
	it('asks for the list of users', function(done) {
		agent.get('/users/')
			.end(function(err, res) {
				expect(200)
				const users = res.body
				expect(users).not.toBeUndefined()
				if (users !== undefined) {
					expect(users.length).toBe(2)
					if (users.length == 2) {
						expect(users[0].nick).toBe('user1')
						expect(users[1].nick).toBe('user2')
					}
				}
				done()
			})
	})
	
	it('makes user1 enter a channel', function(done) {
		agent.put('/user/' + id1 + '/channels/talk/join/')
			.end(function(err, res) {
				expect(200)
				const users = res.body
				expect(users).not.toBeUndefined()
				if (users !== undefined) {
					expect(users.length).toBe(1)
					if (users.length == 1) {
						expect(users[0].nick).toBe('user1')
					}
				}
				done()
			})
	})
	
	it('makes user1 talk in channel', function(done) {
		agent.put('/user/' + id1 + '/channels/talk/say')
			.send({message: 'Message 1'})
			.end(function(err, res) {
				expect(200)
				const user = res.body
				expect(user).not.toBeUndefined()
				if (user !== undefined) {
					expect(user.nick).toBe('user1')
				}
				done()
			})
	})
	
	it('makes user2 enter a channel', function(done) {
		agent.put('/user/' + id2 + '/channels/talk/join/')
			.end(function(err, res) {
				expect(200)
				const users = res.body
				expect(users).not.toBeUndefined()
				if (users !== undefined) {
					expect(users.length).toBe(2)
					if (users.length == 2) {
						expect(users[0].nick).toBe('user1')
						expect(users[1].nick).toBe('user2')
					}
				}
				done()
			})
	})
	
	it('makes user1 talk again in channel', function(done) {
		agent.put('/user/' + id1 + '/channels/talk/say/')
			.send({message: 'Message 2'})
			.end(function(err, res) {
				expect(200)
				const user = res.body
				expect(user).not.toBeUndefined()
				if (user !== undefined) {
					expect(user.nick).toBe('user1')
				}
				done()
			})
	})
    
    it('makes user1 send a private message to user2', function(done) {
        agent.put('/user/' + id1 + '/message/user2/')
            .send({ message: 'Private message' })
            .end(function(err, res) {
                expect(200)
                const user = res.body
                expect(user).not.toBeUndefined()
                expect(user.nick).toBe('user2')
                done()
            })
    })

	
	it('makes user1 check for notices', function(done) {
		agent.get('/user/' + id1 + '/notices/')
			.end(function(err, res) {
                expect(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                expect(notices.length).toEqual(4)
				if (notices.length == 4) {
                    expect(notices[0].type).toEqual('channelJoin')
                    expect(notices[0].nick).toEqual('user1')
                    expect(notices[0].channel).toEqual('talk')
                    expect(notices[0].time).not.toBeUndefined()
                    if (notices[0].time !== undefined) {
                        expect(notices[0].time.length).toBe(24)
                    }

                    expect(notices[1].type).toEqual('channelMessage')
                    expect(notices[1].nick).toEqual('user1')
                    expect(notices[1].channel).toEqual('talk')
                    expect(notices[1].message).toEqual('Message 1')
                    expect(notices[1].time).not.toBeUndefined()
                    if (notices[1].time !== undefined) {
                        expect(notices[1].time.length).toBe(24)
                    }

                    expect(notices[2].type).toEqual('channelJoin')
                    expect(notices[2].nick).toEqual('user2')
                    expect(notices[2].channel).toEqual('talk')
                    expect(notices[2].time).not.toBeUndefined()
                    if (notices[2].time !== undefined) {
                        expect(notices[2].time.length).toBe(24)
                    }

                    expect(notices[3].type).toEqual('channelMessage')
                    expect(notices[3].nick).toEqual('user1')
                    expect(notices[3].channel).toEqual('talk')
                    expect(notices[3].message).toEqual('Message 2')
                    expect(notices[3].time).not.toBeUndefined()
                    if (notices[3].time !== undefined) {
                        expect(notices[3].time.length).toBe(24)
                    }
				}
				done()
			})
	})
	
	it('makes user2 check for notices', function(done) {
		agent.get('/user/' + id2 + '/notices/')
			.end(function(err, res) {
                expect(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                expect(notices.length).toEqual(3)
				if (notices.length == 3) {
                    expect(notices[0].type).toEqual('channelJoin')
                    expect(notices[0].nick).toEqual('user2')
                    expect(notices[0].channel).toEqual('talk')
                    expect(notices[0].time).not.toBeUndefined()
                    if (notices[0].time !== undefined) {
                        expect(notices[0].time.length).toBe(24)
                    }

                    expect(notices[1].type).toEqual('channelMessage')
                    expect(notices[1].nick).toEqual('user1')
                    expect(notices[1].channel).toEqual('talk')
                    expect(notices[1].message).toEqual('Message 2')
                    expect(notices[1].time).not.toBeUndefined()
                    if (notices[1].time !== undefined) {
                        expect(notices[1].time.length).toBe(24)
                    }

                    expect(notices[2].type).toBe('privateMessage')
                    expect(notices[2].sender).toBe('user1')
                    expect(notices[2].message).toBe('Private message')
                    expect(notices[2].time).not.toBeUndefined()
                    if (notices[2].time !== undefined) {
                        expect(notices[2].time.length).toBe(24)
                    }
				}
				done()
			})
	})
	
	it('disconnects user1', function(done) {
		agent.del('/user/' + id1 + '/disconnect/')
			.end(function(err, res) {
				expect(200)
				const version = res.body
				expect(version).not.toBeUndefined()
				done()
			})
	})
	
	it('makes user2 check for notices again', function(done) {
		agent.get('/user/' + id2 + '/notices/')
			.end(function(err, res) {
                expect(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                expect(notices.length).toEqual(1)
				if (notices.length == 1) {
					expect(notices[0].type).toEqual('channelLeave')
					expect(notices[0].nick).toEqual('user1')
					expect(notices[0].channel).toEqual('talk')
                    expect(notices[0].time).not.toBeUndefined()
                    if (notices[0].time !== undefined) {
                        expect(notices[0].time.length).toBe(24)
                    }
				}
				done()
			})
	})
})
