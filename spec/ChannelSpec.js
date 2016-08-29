var app = require('../server'),
    request = require('supertest');

describe('App', function() {
    it('join a channel', function(done) {
        const agent = request.agent(app);

        agent.post('/users/register/toto').end(function(err, res){
            expect(err).toBeNull();

            const id = res.body.id;
            expect(id).not.toBeUndefined();

            agent.put('/user/' + id + '/channels/toto/join/').end(function(err, res) {
                expect(err).toBeNull();

                const channels = res.body.channels;
                expect(Object.keys(channels)).toContain('toto');

                agent.put('/user/' + id + '/channels/toto/say/')
                    .send({'message': 'hello world!'})
                    .end(function(err, res) {
                        expect(err).toBeNull();

                        const notices = res.body.notices;
                        expect(notices.length).toEqual(2);
                        expect(notices[0].message).toBeUndefined();
                        expect(notices[1].message).toEqual('hello world!');
                        done();
                    })
            })

        });
    })
});
