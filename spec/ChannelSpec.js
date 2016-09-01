var app = require('../server'),
    request = require('supertest');

describe('Valid app', function() {
    const agent = request.agent(app);
    let id;
    it('connects to server', function(done){
        agent.post('/users/register/toto/')
			.end(function(err, res) {
				expect(200);
				id = res.body.id;
				expect(id).not.toBeUndefined();
				done()
			})
    })
	
	it('asks who is a user', function(done) {
		agent.get('/users/whois/toto/')
			.end(function(err, res) {
				expect(200)
				const user = res.body;
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
                expect(200);
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
            .send({ message: 'Hello, world!' })
            .end(function(err, res) {
                expect(200)
                const user = res.body;
                expect(user).not.toBeUndefined();
                expect(user.id).toEqual(id);
				done()
            })
    })
    
    it('talks in another channel', function(done) {
        agent.put('/user/' + id + '/channels/channel-2/say/')
            .send({ message: 'Hello, world!' })
            .end(function(err, res) {
                expect(200)
                const user = res.body;
                expect(user).not.toBeUndefined();
                expect(user.id).toEqual(id);
				done()
            })
    })
    
    it('checks for notices', function(done) {
        agent.get('/user/' + id + '/notices/')
            .end(function(err, res) {
                expect(200)
                const notices = res.body
                expect(notices).not.toBeUndefined()
                expect(notices.length).toEqual(3)
				if (notices.length == 3) {
					expect(notices[0].type).toEqual('channelJoin');
					expect(notices[0].nick).toEqual('toto');
					expect(notices[0].channel).toEqual('channel-1');
					
					expect(notices[1].type).toEqual('channelMessage');
					expect(notices[1].nick).toEqual('toto');
					expect(notices[1].channel).toEqual('channel-1');
					
					expect(notices[2].type).toEqual('channelMessage');
					expect(notices[2].nick).toEqual('toto');
					expect(notices[2].channel).toEqual('channel-2');
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
});

describe('Invalid app', function() {
    const agent = request.agent(app);
    let id;
    it('connects to server', function(done){
        agent.post('/users/register/toto/')
		.end(function(err, res) {
				expect(200)
				id = res.body.id;
				expect(id).not.toBeUndefined();
				done()
			})
    })
    
	it('asks who is a user', function(done) {
		agent.get('/users/whois/nobody/')
			.end(function(err, res) {
				expect(404)
				const message = res.body;
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
                expect(404);
                const message = res.body;
                expect(message).not.toBeUndefined();
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
                const message = res.body;
                expect(message).not.toBeUndefined();
				if (message !== undefined) {
					expect(message.error).toEqual('Unknown user ID')
				}
				done()
            })
    })
    
    it('checks for notices', function(done) {
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
})
