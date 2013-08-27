ABSTRACT
--------
This project aims to implement an online-multiplayer Version of
"Ultimate TicTacToe" (2T3) as described in this blogpost:

http://mathwithbaddrawings.com/2013/06/16/ultimate-tic-tac-toe/

Gameplay implementations, both single- and multiplayer have existed
before, however I wanted this implementation to mostly be an API 
Proof-of-Concept. Said JSON API could now for Instance be used in,
say, an Android app, which would instantly be able to also play
against web-based clients :)

A live demo can be found on http://tictac.kitinfo.de/

INSTALLATION
------------
Server-side requirements: PHP5 with SQLite Extension (unless 
you chose to implement another backend, which should be entirely
possible)

ISSUES
------
The one thing I will not accept criticism for is the use of a database
for message-passing. I know quite well that choice is suboptimal and,
in fact, a database is the wrong data storage mechanism. I however
did not want to use WebSockets because they would need server-side
support (last I checked, lighttpd only supported them by some core
code patches), and did not want to use Firebase/<insert hip framework here>
because I just don't.

All other issues I will happily accept via Email (cb@cbcdn.com)

CREDITS & SHOUTS
----------------
Thanks to klaxa for help with the SVG stuffs
Thanks to c_14 for being the first real-life playtester
Greetings to the awesome people in #kitinfo ;)