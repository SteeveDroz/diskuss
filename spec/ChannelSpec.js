var app = require('../server'),
    request = require('supertest');

describe('Valid app', function() {
    const agent = request.agent(app);
    let id;
    it('connects to server', function(){
        agent.post('/users/register/toto/').end(function(err, res) {
            expect(err).toBeNull();
            id = res.body.id;
            expect(id).not.toBeUndefined();
        })
    })
    
    it('joins a channel', function() {
        agent.put('/user/' + id + '/channels/channel-1/join/')
            .end(function(err, res) {
                done()
                expect(err).toBeNull();
                const user = res.body.user;
                expect(user).not.toBeNull();
                expect(user.id).toEqual(id);
            })
    })
    
    it('talks in channel', function() {
        agent.put('/user/' + id + '/channels/channel-1/say/')
            .send({ message: 'Hello, world!' })
            .end(function(err, res) {
                done()
                expect(err).toBeNull()
                const user = res.body.user;
                expect(user).not.toBeNull();
                expect(user.id).toEqual(id);
            })
    })
    
    it('checks for notices', function() {
        agent.put('/user/' + id + '/notices/')
            .end(function(err, res) {
                done()
                expect(err).toBeNull()
                const notices = res.body.notices
                expect(notices).not.toBeNull()
                expect(notices.length).toEqual(2)
                expect(notices[0]['type']).toEqual('channelJoin');
                expect(notices[0]['nick']).toEqual('toto');
                expect(notices[0]['channel']).toEqual('channel-1');
                
                expect(notices[1]['type']).toEqual('channelMessage');
                expect(notices[1]['nick']).toEqual('toto');
                expect(notices[1]['channel']).toEqual('channel-1');
            })
    })
    
    it('disconnects', function() {
        agent.put('/user/' + id + '/disconnect/')
            .end(function(err, res) {
                done()
                expect(err).toBeNull()
                const version = res.body.version
                expect(version).not.toBeNull()
            })
    })
});

describe('Invalid app', function() {
    // TODO Invalid actions
})
