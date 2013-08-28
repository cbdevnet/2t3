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
The latest source can be found at http://dev.cbcdn.com/2t3/

INSTALLATION
------------
Server-side requirements: PHP5 with SQLite extension (unless 
you chose to implement another backend, which should be entirely
possible) as well as the JSON extensions (which are built-in for most
distributions)

Client-side requirements: A decent browser. The most advanced JS features
this uses are probably Array.push() and Array.forEach, and those 
should be pretty widely supported by now (Tests were done with Opera 12,
Chrome <insert big-ass version number here> and Firefox 22).

Remember to update the database path in message.php

ISSUES
------
The one thing I will not accept criticism for is the use of a database
for message-passing. I know quite well that choice is suboptimal and,
in fact, a database is the wrong data storage mechanism. I however
did not want to use WebSockets because they would need server-side
support (last I checked, lighttpd only supported them by some core
code patches), and did not want to use Firebase/<insert hip framework here>
because I just don't. I will however look into any suggested alternatives.

All other issues I will happily accept via Email (cb@cbcdn.com)

CREDITS & SHOUTS
----------------
Thanks to klaxa for help with the SVG stuffs
Thanks to c_14 for being the first real-life playtester
Greetings to the awesome people in #kitinfo ;)