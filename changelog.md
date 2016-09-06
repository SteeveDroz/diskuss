# Changelog

Here are all the updates since v1.0

## [v1.2]: Logical update

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

## [v1.1]: Idle update

Diskuss uses notices to check if users are still connected. The server postulates that any client that hasn't checked for notices in the last 5 seconds must be disconnected and removes it from the list of users.


## [v1.0]: Original release

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

[v1.0]: https://github.com/SteeveDroz/diskuss/compare/v0.1-alpha...v1.0
[v1.1]: https://github.com/SteeveDroz/diskuss/compare/v1.0...v1.1
[v1.1.1]: https://github.com/SteeveDroz/diskuss/compare/v1.1...v1.1.1
[v1.1.2]: https://github.com/SteeveDroz/diskuss/compare/v1.1.1...v1.1.2
[v1.2]: https://github.com/SteeveDroz/diskuss/compare/v1.1.2...v1.2
