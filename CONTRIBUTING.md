# Thanks for contributing

Diskuss is a small project, but with your help, we can be small & good!

Please keep in mind the followings before contributing.

## Issues

### Questions

Questions are appreciated in the issues, just be sure it hasn't been answered yet in the [closed issues](https://github.com/SteeveDroz/diskuss/issues?q=is%3Aissue+is%3Aclosed).

### Bug report

To file a bug report, please follow these indications:

- Find a good title, the problem must be clear before clicking.
- Give a thourough description, this is not 2000's SMS, you don't have to pay for extra characters.
- Provide some code if possible, show us the piece of code that broke The Matrix, so there is something to work on.
- Tell us how you did it, a non-reproductible bug isn't easy to fix.

### Enhancement

Is the software missing a crucial feature? Don't worry, we're aware of that! Just tell us what you'd like to see implemented first. Describe your feature as well as possible, remember that the programmer who'll take care of that won't implement what you said, but what he understood.

## Pull request

You are a programmer and you would like to improve Diskuss? Be my guest! Maybe you're a Node.js expert, maybe you're a newbie who wants to start somewhere, in any case feel free to help. Any *not quite acceptable* pull request will be diskussed :wink: and you will have a chance to improve it.

Your pull request must contain at least:

- The description of the new feature in `api.ejs`.
- As many unit tests as required (hint: it's never enough)
  - in `/spec/01_UserSpec.js` if it's about a user.
  - in `/spec/02_ValidSpec.js` and `/spec/03_InvalidSpec.js` if the feature only concerns one user, put a working example in the valid specs and examples creating errors in the invalid specs.
  - in `/spec/03_MultiSpec.js` if more than one user is concerned.
- The code itself in `server.js`.
- A short description of your addition in the "dev" section of `changelog.md`.

Please be aware that Test Driven Development is used for this project, try to implement all the new features in that order.

Have fun and again, thanks for contributing!
