var User = require('../app/models/User')

describe("User", function() {
    it("has nick, id, channels and notices", function() {
        let user = new User("Yoan")
        expect(user.nick).toEqual("Yoan")
        expect(user.id).not.toBeUndefined()
        expect(user.channels).not.toBeUndefined()
        expect(user.notices).not.toBeUndefined()
    })

    it("must have a nick or be anonymous", function() {
        let user = new User()
        expect(user.nick).toEqual("Anonymous")
    })
})
