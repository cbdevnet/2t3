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
possible) as well as the JSON extensions (which are built-in for 
most distributions)

Client-side requirements: A decent browser. The most advanced JS 
features this uses are probably Array.push() and Array.forEach(), 
which should be pretty widely supported by now (Tests were done 
with Opera 12, Chrome <insert big-ass version number here> and 
Firefox 22).

Remember to update the database path in message.php

API
---
The game can be played via JSON objects POSTed to and read from 
messages.php. All requests must contain the "auth" object, 
describing the sending/receiving player.

	"auth" object structure
		"auth":{
			"name":"Player Name",
			"secret":"Player Secret",
			"session":0		//Numeric Session ID
		}

The name and secret serve to create unique identifiers for players,
while the session ID is used to allow playing via multiple windows
in the same browser.

All responses will at minimum contain the "code" and "status" keys,
with "code" being an integer describing the result of the last action
(negative values indicate errors) and "status" being a string
describing said action.

If basic correctness of the request is ensured, the response will also
always contain the "player" and "handle" keys, containing the player
name and message handle, respectively.

For easy serialization, game fields are identified by numbering them
from 0 to 9, left to right first, from top to bottom. A single field
is identified by it's outer and inner field ID, the outer one
identifying the "big" square, the inner one referencing the position
within that.

To begin or join a game, a "Game Identifier" needs to be requested or 
provided. Initiating a game is done by accessing the ?gid endpoint. 
This endpoint will return a "game" object, containing a game ID and a 
game message target.

	"game" object structure
		"game":{
			"id":0,			//Numeric Game ID
			"target":"Game Message Target"
		} 

Messages waiting for the current user/game pair can be queried via the 
?get Endpoint, which is to be given the auth and game objects as input.
If unread messages are present, the "messages" respone key will contain 
an array of message objects.

	"messages" entry object structure
		{
			"sender":"Sender Message ID",
			"type":"Message Type",
			"data":{
				//Message Payload
			}
		}

Subsequent player-to-player communication is done by exchanging messages,
which are described hereinafter (I love that word!).

getstate message
	Query state of specified game from game peers.
	The initiating peer will usually assign the sender of the first
	incoming getstate message the opposite faction to play.

	Sending endpoint: ?getstate
	Sending parameters: auth, game
	Received payload: hashname (Display name of sender)

pushstate message
	Inform requesting peer of current game metastatus.

	Sending endpoint: ?pushstate
	Sending parameters: auth, game, to (receiving message target), meta, 
			[moves] (array of "move" objects, currently unused)
	Received payload: game, meta

	"meta" object structure
		"meta":{
			"currentplayer":"x",	//alternatively, "o"
			"player_x":"Player X hashname",
			"player_o":"Player O hashname"
		}

move message
	Send a move to the opposing player

	Sending endpoint: ?move
	Sending parameters: auth, game, to, move
	Received payload: game, move

	"move" object structure
		"move":{
			"outer":0,	//inner field ID (0-9)
			"inner":0,	//outer field ID (0-9)
			"player":"x"	//alternatively, "o"
		}


ISSUES
------
The one thing I will not accept criticism for is the use of a 
database for message-passing. I know quite well that choice is 
suboptimal and, in fact, a database is the wrong data storage 
mechanism. I however did not want to use WebSockets because they
would need server-side support (last I checked, lighttpd only 
supported them by some core code patches), and did not want to use 
Firebase/<insert hip framework here> because I just don't. 
I will however look into any suggested alternatives.

You are also very much invited to create your own front- and 
backends for the underlying API :)

All other issues I will happily accept via Email (cb@cbcdn.com)

CREDITS & SHOUTS
----------------
Thanks to klaxa for help with the SVG stuffs
Thanks to c_14 for being the first real-life playtester
Shouts go out to the awesome people in #kitinfo ;)
