# Changelog

Here are all the updates since v1.0

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
