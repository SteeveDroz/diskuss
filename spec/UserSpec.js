var User = require('../app/models/User')

describe("User", function() {
    it("has nick, id and channels", function() {
        let user = new User("Yoan")
        expect(user.nick).toEqual("Yoan")
        expect(user.id).not.toBeUndefined()
        expect(user.channels).not.toBeUndefined()
    })

    it("must have a nick or be anonymous", function() {
        let user = new User()
        expect(user.nick).toEqual("Anonymous")
    })
})
