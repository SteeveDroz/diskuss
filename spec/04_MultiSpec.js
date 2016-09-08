const app = require('../server'),
    request = require('supertest')

describe('Multiuser app', function() {
	const agent = request.agent(app)
	
	let id1, id2, id3
	
	it('connects the first user', function(done) {
		agent.post('/users/register/user1/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
				id1 = res.body.id
				expect(id1).not.toBeUndefined()
				done()
			})
	})
	
	it('connects the second user', function(done) {
		agent.post('/users/register/user2/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
				id2 = res.body.id
				expect(id2).not.toBeUndefined()
				done()
			})
	})
	
	it('asks for the list of users', function(done) {
		agent.get('/users/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
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
    
    it('asks for the list of channels before joining', function(done) {
        agent.get('/channels/')
            .end(function(err, res) {
                expect(res.status).toBe(200)
                const channels = res.body
                expect(channels).not.toBeUndefined()
                if (channels !== undefined) {
                    expect(channels.length).toBe(0)
                }
                done()
            })
    })
	
	it('makes user1 enter a channel', function(done) {
		agent.put('/user/' + id1 + '/channels/talk/join/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
                const channel = res.body.channel
				const users = res.body.users
                expect(channel).not.toBeUndefined()
                if (channel !== undefined) {
                    expect(channel.name).toBe('talk')
                }
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
	
    it('asks for the list of channels after joining', function(done) {
        agent.get('/channels/')
            .end(function(err, res) {
                expect(res.status).toBe(200)
                const channels = res.body
                expect(channels).not.toBeUndefined()
                if (channels !== undefined) {
                    expect(channels.length).toBe(1)
                    if (channels.length == 1) {
                        expect(channels[0]).toBe('talk')
                    }
                }
                done()
            })
    })
	
	it('makes user1 enter another channel', function(done) {
		agent.put('/user/' + id1 + '/channels/chat/join/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
                const channel = res.body.channel
                expect(channel).not.toBeUndefined()
                if (channel !== undefined) {
                    expect(channel.name).toBe('chat')
                }
				const users = res.body.users
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
	
    it('asks for the list of channels after joining a second one', function(done) {
        agent.get('/channels/')
            .end(function(err, res) {
                expect(res.status).toBe(200)
                const channels = res.body
                expect(channels).not.toBeUndefined()
                if (channels !== undefined) {
                    expect(channels.length).toBe(2)
                    if (channels.length == 2) {
                        expect(channels[0]).toBe('talk')
                        expect(channels[1]).toBe('chat')
                    }
                }
                done()
            })
    })
	
	it('makes user1 talk in channel', function(done) {
		agent.put('/user/' + id1 + '/channels/talk/say')
			.send({message: 'Message 1'})
			.end(function(err, res) {
                expect(res.status).toBe(200)
				const status = res.body.status
				expect(status).toBe('Message sent correctly')
                const message = res.body.message
                expect(message).toBe('Message 1')
				done()
			})
	})
	
	it('makes user2 enter a channel', function(done) {
		agent.put('/user/' + id2 + '/channels/talk/join/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
                const channel = res.body.channel
                expect(channel).not.toBeUndefined()
                if (channel !== undefined) {
                    expect(channel.name).toBe('talk')
                }
				const users = res.body.users
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
	
	it('makes user1 talk in channel again', function(done) {
		agent.put('/user/' + id1 + '/channels/talk/say/')
			.send({message: 'Message 2'})
			.end(function(err, res) {
                expect(res.status).toBe(200)
				const status = res.body.status
				expect(status).toBe('Message sent correctly')
                const message = res.body.message
                expect(message).toBe('Message 2')
				done()
			})
	})
    
    it('makes user1 send a private message to user2', function(done) {
        agent.put('/user/' + id1 + '/message/user2/')
            .send({ message: 'Private message' })
            .end(function(err, res) {
                expect(res.status).toBe(200)
				const status = res.body.status
				expect(status).toBe('Private message sent correctly')
                const message = res.body.message
                expect(message).toBe('Private message')
                const recipient = res.body.recipient
                expect(recipient).not.toBeUndefined()
                if (recipient !== undefined) {
                    expect(recipient.nick).toBe('user2')
                }
                done()
            })
    })
    
    it('makes user1 change the channel description', function(done) {
        agent.put('/user/' + id1 + '/channel/talk/description/')
            .send({ description: 'Talk in there' })
            .end(function(err, res) {
                expect(res.status).toBe(200)
                const status = res.body.status
                expect(status).toBe('Changing the description')
                const channel = res.body.channel
                expect(channel).not.toBeUndefined
                if (channel !== undefined) {
                    expect(channel.name).toBe('talk')
                }
                const description = res.body.description
                expect(description).toBe('Talk in there')
                done()
            })
    })
	
	it('makes user1 check for notices', function(done) {
		agent.get('/user/' + id1 + '/notices/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                if (notices !== undefined) {
                    expect(notices.length).toEqual(6)
                    if (notices.length == 6) {
                        expect(notices[0].type).toEqual('channelJoin')
                        expect(notices[0].nick).toEqual('user1')
                        expect(notices[0].channel).toEqual('talk')
                        expect(notices[0].time).not.toBeUndefined()
                        if (notices[0].time !== undefined) {
                            expect(notices[0].time.length).toBe(24)
                        }

                        expect(notices[1].type).toEqual('channelJoin')
                        expect(notices[1].nick).toEqual('user1')
                        expect(notices[1].channel).toEqual('chat')
                        expect(notices[1].time).not.toBeUndefined()
                        if (notices[1].time !== undefined) {
                            expect(notices[1].time.length).toBe(24)
                        }

                        expect(notices[2].type).toEqual('channelMessage')
                        expect(notices[2].nick).toEqual('user1')
                        expect(notices[2].channel).toEqual('talk')
                        expect(notices[2].message).toEqual('Message 1')
                        expect(notices[2].time).not.toBeUndefined()
                        if (notices[2].time !== undefined) {
                            expect(notices[2].time.length).toBe(24)
                        }

                        expect(notices[3].type).toEqual('channelJoin')
                        expect(notices[3].nick).toEqual('user2')
                        expect(notices[3].channel).toEqual('talk')
                        expect(notices[3].time).not.toBeUndefined()
                        if (notices[3].time !== undefined) {
                            expect(notices[3].time.length).toBe(24)
                        }

                        expect(notices[4].type).toEqual('channelMessage')
                        expect(notices[4].nick).toEqual('user1')
                        expect(notices[4].channel).toEqual('talk')
                        expect(notices[4].message).toEqual('Message 2')
                        expect(notices[4].time).not.toBeUndefined()
                        if (notices[4].time !== undefined) {
                            expect(notices[4].time.length).toBe(24)
                        }
                        
                        expect(notices[5].type).toEqual('channelDescription')
                        expect(notices[5].nick).toEqual('user1')
                        expect(notices[5].channel).toEqual('talk')
                        expect(notices[5].description).toEqual('Talk in there')
                        expect(notices[5].time).not.toBeUndefined()
                        if (notices[5].time !== undefined) {
                            expect(notices[5].time.length).toBe(24)
                        }
                    }
				}
				done()
			})
	})
	
	it('makes user2 check for notices', function(done) {
		agent.get('/user/' + id2 + '/notices/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                if (notices !== undefined) {
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
                        
                        expect(notices[3].type).toEqual('channelDescription')
                        expect(notices[3].nick).toEqual('user1')
                        expect(notices[3].channel).toEqual('talk')
                        expect(notices[3].description).toEqual('Talk in there')
                        expect(notices[3].time).not.toBeUndefined()
                        if (notices[3].time !== undefined) {
                            expect(notices[3].time.length).toBe(24)
                        }
                    }
				}
				done()
			})
	})
	
	it('disconnects user1', function(done) {
		agent.del('/user/' + id1 + '/disconnect/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
				const status = res.body.status
				expect(status).toBe('Successfully disconnected from the server')
				done()
			})
	})
    	
	it('makes user2 check for notices again', function(done) {
		agent.get('/user/' + id2 + '/notices/')
			.end(function(err, res) {
                expect(res.status).toBe(200)
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
    
    it('connects user3', function(done) {
        agent.post('/users/register/user3/')
            .end(function(err, res) {
                expect(res.status).toBe(200)
                id3 = res.body.id
                expect(id3).not.toBeUndefined()
                done()
            })
    })
    
    it('waits for 6 seconds', function(done) {
        setTimeout(done, 6000 /* 6 seconds */)
    }, 10000 /* Jasmine timeout */)
    
    it('makes user2 check for notices after 6 seconds', function(done) {
        agent.get('/user/' + id2 + '/notices/')
            .end(function(err, res) {
                expect(res.status).toBe(200)
                done()
            })
    })
    
    it('makes user3 check for notices', function(done) {
        agent.get('/user/' + id3 + '/notices/')
            .end(function(err, res) {
                expect(res.status).toBe(404)
                const notice = res.body
                expect(notice).not.toBeUndefined()
                if (notice !== undefined) {
                    expect(notice.error).toBe('Unknown user ID')
                }
                done()
            })
    })
    
    it('makes user2 leave the channel', function(done) {
        agent.del('/user/' + id2 + '/channels/talk/leave/')
            .end(function(err, res) {
                expect(res.status).toBe(200)
                const status = res.body.status
                expect(status).toBe('Leaving the channel')
                const channel = res.body.channel
                expect(channel).not.toBeUndefined()
                if (channel !== undefined) {
                    expect(channel.name).toBe('talk')
                }
                done()
            })
    })
    
    it('disconnects user2', function(done) {
        agent.del('/user/' + id2 + '/disconnect/')
            .end(function(err, res) {
                expect(res.status).toBe(200)
                const status = res.body.status
                expect(status).toBe('Successfully disconnected from the server')
                done()
            })
    })
})
