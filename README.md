Puzzle Master (web edition)
===========================

Welcome to Puzzle Master! This edition is the **HTML5** implementation of the popular Puzzle Master app.  
URL of the Qt edition: https://github.com/Venemo/puzzle-master

Goals and purpose
-----------------

This project was born in order to provide something for those platforms where Qt is not available.
Also, I've since a long time had a dream to run Puzzle Master in web browsers so that people can
take a look and have fun, whatever platform they are using.

The reason why I've started it now is because HTML5-based platforms like Firefox OS, Tizen (and Windows 8) are
emerging and I see this as a great time to port the app to these platforms.

Supported platforms
-------------------

At this moment

* Firefox OS
* *the web*

Planned

* Tizen
* Windows 8

Developer info
--------------

This version is built following a very similar structure as the Qt and the XNA editions, but of course
has a HTML flavour.

Every component is located in the `PM` namespace

* **PM.RenderLoop** - an efficient rendering implementation based on `requestAnimationFrame`
* **PM.Game** - manages game logics and interaction
* **PM.Piece** - represents a single piece of the puzzle, implementing coordinate transforms and similar yummy things

Everything is wired together in `app.js` which initializes the UI and starts the game.

