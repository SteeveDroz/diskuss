# Changelog

Here are all the updates since v1.0

## [dev]: Current updates

None, `dev` is up to date.

## [v1.6.0]: Kicking update
The change log is more taken care of:

- Indenting has been fixed.
- The "dev" chapter has been added.

Users can now be kicked out of channels by owner.
Users can also be banned and unbanned by owner.
Users connected to the server all receive a notice when a new channel is created.

## [v1.5.0]: Information update

Informations about channels can be obtained.

Regression bugs in the unit tests made the build fail, they have been fixed.

## [v1.4.2]: Moderated update

Fixing a bug where two people wanting the same username crashed the server.

Fixing a bug where the disconnecting of idling users wasn't notified to other users.

## [v1.4.1]: Moderated update

Server now allows [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing), useful for AJAX developpers.

## [v1.4.0]: Moderated update

Channels now belong to the user who first joined it.

Changes:

- An owner (and only them) can:

  - Change the description of the channel
  - Keep or release the channel
  - Permanently transfer their ownership of the channel to another user

- Update of all the notices example to include owners
- Various bug fixes

## [v1.3.0]: Channel update

**:warning: This update breaks a little backwards compatibility! The notices have changed**

The "channel" side of the application has been developped.

- Channel descriptions can be changed.
- Channels can be kept even if no user is in (the description will remain, more features are to be added)
- Notices have been changed. When a channel name was part of it, it has been replaced by a channel object containing all the useful data.
- Use of JavaScript in the API to ease the writing of new features.
- Various bug fixes.

## [v1.2.0]: Logical update

**:warning: This update breaks backwards compatibility!**

To be more logical, the responses have been changed. It was, for example, not logical at all that leaving a channel would return the user object of oneself.

The following responses have been updated:

- **Disconnection** now sends a JSON object with `status` property.
- **Join channel** now sends a JSON object containing a `channel` and a `users` propoerties.
- **Talk in channel** now sends a JSON object containing a `status` and a `message` properties.
- **Leave channel** now sends a JSON object containing a `status` and a `channel` properties.
- **Send private message** now sends a JSON object containing a `status`, a `message` and a `recipient` properties.

## [v1.1.2]: Idle update

The following features have been fixed:

- The last user leaving a channel destroys it.
- Asking for a list of channels returns the expected value.

## [v1.1.1]: Idle update

The informations about v1.1 have been added to the API.

## [v1.1.0]: Idle update

Diskuss uses notices to check if users are still connected. The server postulates that any client that hasn't checked for notices in the last 5 seconds must be disconnected and removes it from the list of users.

## [v1.0.0]: Original release

The application was created from scratch, the current version offers the following features:

- Display the API
- Connect to a server
- Disconnect from the server
- Request server informations
- List connected users
- List channels
- Ask informations about a user (whois)
- Join a channel
- Talk in a channel
- Leave a channel
- Send a private message to another user
- Fetch notices

[dev]: https://github.com/SteeveDroz/diskuss/compare/master...dev
[v1.0.0]: https://github.com/SteeveDroz/diskuss/compare/v0.1-alpha...v1.0.0
[v1.1.0]: https://github.com/SteeveDroz/diskuss/compare/v1.0.0...v1.1.0
[v1.1.1]: https://github.com/SteeveDroz/diskuss/compare/v1.1.0...v1.1.1
[v1.1.2]: https://github.com/SteeveDroz/diskuss/compare/v1.1.1...v1.1.2
[v1.2.0]: https://github.com/SteeveDroz/diskuss/compare/v1.1.2...v1.2.0
[v1.3.0]: https://github.com/SteeveDroz/diskuss/compare/v1.2.0...v1.3.0
[v1.4.0]: https://github.com/SteeveDroz/diskuss/compare/v1.3.0...v1.4.0
[v1.4.1]: https://github.com/SteeveDroz/diskuss/compare/v1.4.0...v1.4.1
[v1.4.2]: https://github.com/SteeveDroz/diskuss/compare/v1.4.1...v1.4.2
[v1.5.0]: https://github.com/SteeveDroz/diskuss/compare/v1.4.2...v1.5.0
[v1.6.0]: https://github.com/SteeveDroz/diskuss/compare/v1.5.0...v1.6.0
