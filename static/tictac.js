var gui={
	dim:function(state){
		document.getElementById("dim").style.display=(state?"block":"none");
	},

	statusDisplay:function(text){
		document.getElementById("status-display").innerHTML=text;
	},
	
	updateTurn:function(player){
		var elem=document.getElementById("current-player-image");
		elem.style.backgroundSize="100% 100%";
		elem.style.backgroundImage="url("+gui.getImageForPlayer(player)+")";
	},
	
	getImageForPlayer:function(p){
		switch(p){
			case "x":
			case "X":
				return "static/x.svg";
			case "o":
			case "O":
				return "static/o.svg";
			default:
				debug.err("Image for invalid player "+p+" requested");
				return false;
		}
	},
	
	updateStatic:function(){
		debug.log("Updating static view controls");
		document.getElementById("player-info").textContent=tictac.local.hashname;//should hopefully work in all major browsers without XSS
		document.getElementById("game-link").value=document.location.href+"#"+escape(tictac.game.id)+"!"+escape(tictac.game.target);

		["x","o"].forEach(function(sign){
			var elem=document.getElementById("player-"+sign+"-name");
			if(tictac.meta["player_"+sign]==tictac.local.hashname){
				elem.textContent="You!";
			}
			else{
				elem.textContent=(tictac.meta["player_"+sign])?tictac.meta["player_"+sign]:"?";
			}
		});		
	},
	
	field:{
		click:function(event){
			/*HOOK: LOCAL MOVE*/
			if(!tictac.local.ready){
				debug.wrn("Game not ready yet, ignoring");
				return;
			}
			//create move object
			var move=new Move(event.target.getAttribute("data-outer"),event.target.getAttribute("data-inner"),tictac.local.sign);
			
			//run through handleMove
			if(tictac.handleMove(move)){
				comm.pushMove(move);
			}
			else{
				debug.wrn("Illegal local move, ignoring");
			}
		},
		clear:function(){
			//kill field
			document.getElementById("field").innerHTML="";
		},
		empty:function(){
			//create empty field
			for(var i=0;i<3;i++){
				document.getElementById("field").appendChild(gui.field.outer.createRow(i));
			}
		},
		index:function(){
			//create mapping of x|y pairs to blocks
			for(var i=0;i<9;i++){
				tictac.local.blocks[i]=[];
			}
			var blockList=document.getElementsByClassName("block");
			debug.log("Got "+blockList.length+" blocks to map");
			for(var i=0;i<blockList.length;i++){
				var outer=(blockList[i].getAttribute("data-outer"))-1;
				var inner=(blockList[i].getAttribute("data-inner"))-1;
				tictac.local.blocks[outer][inner]=blockList[i];
			}
			debug.log("Mapped to "+tictac.local.blocks.length+" outer fields");
			
			//index innerfields
			var fields=document.getElementsByClassName("innerfield");
			debug.log("Got "+fields.length+" fields to index");
			for(var i=0;i<fields.length;i++){
				tictac.local.fields[i]=fields[i];
			}
		},
		init:function(){
			//clear, create empty
			gui.field.clear();
			gui.field.empty();
			gui.field.index();
		},
		updateGfx:function(outer,inner,gfx){//onebased
			var elem=tictac.local.blocks[outer-1][inner-1];
			elem.style.backgroundSize="100% 100%";
			elem.style.backgroundImage="url("+gui.getImageForPlayer(gfx)+")";
		},
		highlightOuter:function(index){//onebased
			var nodes=document.getElementsByClassName("innerfield");
			for(var i=0;i<nodes.length;i++){
				nodes[i].style.backgroundColor="#666";
				if(i==index-1){
					nodes[i].style.backgroundColor="inherit";
				}
			}
		},
		clearHighlight:function(){
			var nodes=document.getElementsByClassName("innerfield");
			for(var i=0;i<nodes.length;i++){
				nodes[i].style.backgroundColor="inherit";
			}
		},
		fieldBackground:function(field,player){
			//FIXME highlight winning row with red bars
			if(!tictac.local.fields[field-1]){
				debug.err("Invalid field "+field+" supplied for background update");
				return;
			}
			tictac.local.fields[field-1].style.backgroundSize="100% 100%";
			tictac.local.fields[field-1].style.backgroundImage="url("+gui.getImageForPlayer(player)+")";
		},
		inner:{
			createField:function(outer){//onebased
				var elem=document.createElement("div");
				elem.className="innerfield";
				for(var i=1;i<=3;i++){
					elem.appendChild(gui.field.inner.createColumn(outer,i));
				}
				return elem;
			},
			
			createColumn:function(outer, index){
				var elem=document.createElement("div");
				elem.className="inner-col";
				for(var i=index;i<=9;i+=3){
					elem.appendChild(gui.field.inner.createBlock(outer,i));
				}
				return elem;
			},
			
			createBlock:function(outer,inner){
				var elem=document.createElement("div");
				elem.className="block";
				elem.setAttribute("data-outer",outer);
				elem.setAttribute("data-inner",inner);
				elem.onclick=gui.field.click;
				return elem;
			},
			
			dimBlock:function(outer, inner, state){
				//dim out block according to state
				tictac.local.blocks[outer-1][inner-1].style.backgroundColor=state?"#333":"inherit";
				//FIXME this blocks the background image from showing. find some transparency thingy.
			},
			
			highlightBlock:function(outer, inner, state){
				//highlight block according to state
				tictac.local.blocks[outer-1][inner-1].style.borderStyle=state?"dashed":"solid";
			}
		},
		outer:{
			createRow:function(index){//zerobased
				var center=document.createElement("div");
				center.className="outer-row-center";
				for(var i=1;i<=3;i++){
					center.appendChild(gui.field.inner.createField((index*3)+i));
				}
				var row=document.createElement("div");
				row.className="outer-row";
				row.appendChild(center);
				return row;
			}
		}
	},
	
	loginpopup:{
		show:function(){
			gui.dim(true);
			document.getElementById("popup-userdata").className="popup";
		},
		
		hide:function(){
			gui.dim(false);
			document.getElementById("popup-userdata").className="popclose";
		},
		
		validate:function(){
			var name=document.getElementById("playername").value;
			var secret=document.getElementById("playersecret").value;
			if(name&&secret){
				tictac.player.name=name;
				tictac.player.secret=secret;
				tictac.setDataCookie();
				this.hide();
				tictac.setup();//continue setup / reinit
			}
		}
	}
};

var tictac={
	player:{
		name:"",			//plain name of player
		secret:"",			//player secret
		session:""			//session id
	},
	
	local:{
		hashname:"",		//hashname of local player
		sign:"",			//sign of local player
		opponent:"",		//opponents mtarget, filled by first getstate or createGame from hash
		wait_pull:false,	//currently awaiting game state flag
		ready:false,		//currently able to push moves
		blocks:[],			//local map of blocks
		fields:[],			//local map of fields
		moves:[],			//moves array
		wins:[]				//outer field wins
	},
	
	meta:{
		currentplayer:"",
		player_x:"",		//hashname of player x (client, filled by first getstate)
		player_o:""			//hashname of player o (server, filled by comm.getgame)
	},
	
	game:{
		id:"",
		target:""
	},
	
	createGame:function(){
		if(window.location.hash.indexOf("!")!=-1){
			var suppliedData=window.location.hash.substring(1).split("!");
			if(suppliedData.length!=2||!suppliedData[0]||!suppliedData[1]){
				window.alert("Malformed URL.");
				tictac.initNewGame();
				return;
			}
			tictac.game.id=suppliedData[0];
			tictac.game.target=suppliedData[1];
			tictac.local.opponent=suppliedData[1];
			debug.log("Trying to join game "+tictac.game.id);
	
			//get game data from target
			tictac.local.wait_pull=true;
			comm.queryBoardState();
		}
		else{
			tictac.meta.currentplayer='x';
			comm.getGame();
		}
	},

	logout:function(){
		document.cookie="name='{}'";
		gui.loginpopup.show();
	},
	
	setup:function(){
		if(!Array.prototype.containsAll){
			Array.prototype.containsAll=function(other){
				if(!Array.isArray(other)){
					return false;
				}
				for(var i=0;i<other.length;i++){
					if(this.indexOf(other[i])==-1){
						return false;
					}
				}
				return true;
			};
		}
	
		//check cookie
		if(document.cookie.indexOf("name=")==-1){
			gui.loginpopup.show();
			return;
		}
		
		try{
			var userTemp=JSON.parse(unescape(document.cookie.substring(document.cookie.indexOf("name=")+5).split(";")[0]));
		}
		catch(e){
			debug.wrn("Failed to deserialize cookie.");
			gui.loginpopup.show();
			return;
		}
		if(!userTemp.name||!userTemp.secret){
			debug.log("Invalid data in cookie.");
			gui.loginpopup.show();
			return;
		}
		
		tictac.player=userTemp;
		tictac.player.session=Math.floor((Math.random()*1000)+1);
		debug.log("Player data: "+tictac.player.name+" / "+tictac.player.secret+" @ "+tictac.player.session);
		
		//get gameid/create
		tictac.createGame();
	
		gui.field.init();
		
		window.setTimeout(tictac.pumpMessages,1000);
	},
	
	pumpMessages:function(){
		debug.log("Pumping");
		
		//get messages
		var messages=comm.getMessages();
		
		//handle messages
		if(messages){
			messages.forEach(tictac.handleMessage);
		}
		
		//determine next timeout
		if(tictac.local.wait_pull){
			window.setTimeout(tictac.pumpMessages,3000);
		}
		else{
			//linear increase? TODO|DELAYED
			window.setTimeout(tictac.pumpMessages,6000);
		}
	},
	
	setDataCookie:function(){
		document.cookie="name"+"="+escape(JSON.stringify(tictac.player));
	},
	
	handleMessage:function(m){
		switch(m.type){
			case "move":
				/*HOOK: REMOTE MOVE*/
				//if invalid, reply(?)
				//when moving, send id of base move(?)
				
				//check sender, gameid
				if(m.sender!=tictac.local.opponent||m.data.game.id!=tictac.game.id){
					debug.wrn("Got move message from unknown sender");
					return false;
				}
				
				if(m.data.move.player==tictac.local.sign){
					debug.err("Remote player trying to cheat");
					return false;
				}
				
				//'clone' object to force compliance to the Move object spec
				var mv=new Move(m.data.move.outer,m.data.move.inner,m.data.move.player);
				
				//run through handleMove
				if(!tictac.handleMove(mv)){
					debug.err("Illegal remote move!");
					gui.statusDisplay("Opponent sent illegal move!");
				}
				break;
			case "getstate":
				if(!m.data.hashname){
					debug.err("getstate Message missing hashname");
					return false;
				}
				if(!tictac.local.opponent){
					tictac.meta.player_x=m.data.hashname;
					tictac.local.opponent=m.sender;
					tictac.local.ready=true;
					
					gui.statusDisplay("Opponent Joined!");
					gui.updateStatic();
					gui.updateTurn(tictac.meta.currentplayer);
					
					/*HOOK: REMOTE JOIN (SERVER)*/
				}
				comm.sendState(m.sender);
				break;
			case "pushstate":
				//FIXME should be able to accept move array
				//check validity
				if(m.data.game.id!=tictac.game.id||m.sender!=tictac.game.target){
					debug.wrn("Received pushstate for invalid game / from unknown sender");
					return false;
				}
				if(!m.data.meta.currentplayer||!m.data.meta.player_x||!m.data.meta.player_o){
					debug.err("pushstate message was missing meta-info");
					return false;
				}
				
				if(tictac.local.wait_pull){
					tictac.meta=m.data.meta;
					tictac.local.ready=true;
					gui.statusDisplay("Your turn!");
					if(tictac.meta.player_x==tictac.local.hashname){
						debug.log("Game now active, you are playing as X");
						tictac.local.sign="x";
					}
					else if(tictac.meta.player_o==tictac.local.hashname){
						debug.log("Game now active, you are playing as O");
						tictac.local.sign="o";
					}
					else{
						//spectator
						debug.log("You joined as a spectator");
						gui.statusDisplay("Joined as Spectator");
						tictac.local.ready=false;
						/*HOOK: SPECTATOR JOIN*/
					}
					gui.updateStatic();
					gui.updateTurn(tictac.meta.currentplayer);
					tictac.local.wait_pull=false;
					/*HOOK: LOCAL JOIN (CLIENT)*/
				}
				else{
					debug.wrn("Received pushstate while not waiting for it");
				}
				break;
			default:
				debug.wrn("Unknown message type "+m.type);
		}
	},
	
	handleMove:function(move){
		//check move object for validity
			//currentplayer, inner, outer
			if(move.outer<1||move.outer>9||move.inner<1||move.outer>9){
				debug.err("Move object did not comply with spec");
				return false;
			}
			if(move.player!=tictac.meta.currentplayer){
				debug.err("Illegal move: Wrong player");
				return false;
			}
		
		//check move for possibility
		if(tictac.local.moves.length>0){
			
			//check if field already taken
			for(var i=0;i<tictac.local.moves.length;i++){
				if(move.same(tictac.local.moves[i])){
					debug.err("Block already taken");
					return false;
				}
			}
		
			var lastMove=tictac.local.moves[tictac.local.moves.length-1];
			if(move.outer!=lastMove.inner){
				if(!tictac.local.wins[lastMove.inner]){
					debug.err("Was not sent to won field, cannot go here");
					return false;
				}
			}
			
			gui.field.inner.highlightBlock(lastMove.outer,lastMove.inner,false);
		}
		
		//if placed not won and move wins field, mark as won
		if(!tictac.local.wins[move.outer]&&tictac.winsField(move)){
			tictac.local.wins[move.outer]=move.player;
			gui.field.fieldBackground(move.outer,move.player);
		}
		
		//if placed not won, but now full, mark as draw
		if(!tictac.local.wins[move.outer]&&tictac.movesForOuter(move.outer).length==8){
			tictac.local.wins[move.outer]="-";
		}
		
		//check if this move wins the game
		//TODO|DELAYED
		
		//add to array
		tictac.local.moves.push(move);
		
		//set gfx
		gui.field.updateGfx(move.outer,move.inner,move.player);
		
		//clear highlight if outer[inner] was won
		if(tictac.local.wins[move.inner]){
			gui.field.clearHighlight();
		}
		else{
			//update field dim
			gui.field.highlightOuter(move.inner);
		}
		
		gui.field.inner.highlightBlock(move.outer,move.inner,true);
		
		//update currentplayer
		switch(tictac.meta.currentplayer){
			case "x":
			case "X":
				tictac.meta.currentplayer="o";
				break;
			case "o":
			case "O":
				tictac.meta.currentplayer="x";
				break;
			default:
				debug.err("Invalid player "+tictac.meta.currentplayer+" encountered while toggling");
				return false;
		}
		
		if(tictac.meta.currentplayer==tictac.local.sign){
			gui.statusDisplay("Your turn!");
		}
		else{
			gui.statusDisplay("Waiting...");
		}
		
		gui.updateTurn(tictac.meta.currentplayer);
		return true;
	},
	
	movesForOuter:function(outer){
		var board=[];
		if(!outer){
			return board;
		}
		for(var i=0;i<tictac.local.moves.length;i++){
			if((tictac.local.moves[i].outer==outer)){
				board.push(tictac.local.moves[i]);
			}
		}
		return board;
	},
	
	winsField:function(move){
		//check if supplied move wins an outer field
		var boardMoves=tictac.movesForOuter(move.outer);
		var playerMoves=[];
		
		//all blocks owned by this player in the inner field
		for(var i=0;i<boardMoves.length;i++){
			if(boardMoves[i].player==move.player){
				playerMoves.push(boardMoves[i].inner);
			}
		}
		playerMoves.push(move.inner);
		
		//cant win if less than three own moves
		if(playerMoves.length<3){
			return false;
		}
		
		/**
		
		THE FOLLOWING IS _ONE_ METHOD TO CHECK FOR WINS
		IT WILL PROBABLY BE REPLACED BY SOMETHING A LOT COOLER
		IN SOME TIME
		
		**/
		
		var winningCombinations=[[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]];
		
		for(var i=0;i<winningCombinations.length;i++){
			if(winningCombinations[i].indexOf(move.inner)>=0){
				//if contains all, retn true
				if(playerMoves.containsAll(winningCombinations[i])){
					winningCombinations[i].forEach(function(elem){
						gui.field.inner.dimBlock(move.outer,elem,true);
					});
					return true;
				}
			}
		}
		
		/**
		
		END EMBARASSING HACK
		
		**/
		return false;
	}
};

var comm={
	getGame:function(){
		//get (gid|mtarget) pair for new game		
		comm.sendMessage("gid",JSON.stringify({"auth":tictac.player}),function(response){
			if(response.player){
				tictac.local.hashname=response.player;
				tictac.meta.player_o=tictac.local.hashname;
				tictac.local.sign="o";
				/*HOOK: SERVER PLAYER SIGN*/
			}
			else{
				debug.wrn("No player in GID response");
			}
			if(response.game.id&&response.game.target){
				tictac.game=response.game;
			}
			gui.statusDisplay("Waiting for opponent...");
			gui.updateStatic();
		});
	},
	queryBoardState:function(){
		//send data query request for (gameid|target) pair (given name|secret)
		comm.sendMessage("getstate",JSON.stringify({"auth":tictac.player,"game":tictac.game}),function(response){
			if(response.player){
				tictac.local.hashname=response.player;
				gui.updateStatic();
			}			
			gui.statusDisplay("Waiting for game host...");
		});
	},
	getMessages:function(){
		var req=ajax.syncPost("message.php?get",JSON.stringify({"auth":tictac.player,"game":tictac.game}));
		if(req.status==200){
			try{
				var response=JSON.parse(req.responseText);
			}
			catch(e){
				debug.err("Failed to parse message get response");
				gui.statusDisplay("Server answer was incomprehensible!");
				return null;
			}
			if(response.messages){
				debug.log("Got "+response.messages.length+" messages");
				return response.messages;
			}
			return null;
		}
		else{
			debug.err("Querying messages failed with status "+req.status);
			gui.statusDisplay("Failed to get messages!");
			return null;
		}
	},
	sendState:function(to){
		debug.log("Sending state to "+to);
		comm.sendMessage("pushstate",JSON.stringify({"to":to,"auth":tictac.player,"game":tictac.game,"meta":tictac.meta,"moves":tictac.local.moves}),null);
	},
	pushMove:function(move){
		comm.sendMessage("move",JSON.stringify({"to":tictac.local.opponent,"auth":tictac.player,"game":tictac.game,"move":move}),null);
	},
	sendMessage:function(type,data,responseFunc){
		ajax.asyncPost("message.php?"+type,data,function(req){
			if(req.status==200){
				try{
					var response=JSON.parse(req.responseText);
				}
				catch(e){
					debug.err("Response to sending "+type+" was unparseable");
					return;
				}

				if(response.code==-1){
					debug.err("Response code for "+type+" indicates error");
					return;
				}
				
				if(responseFunc){
					responseFunc(response);
				}
				
				debug.log(type+" message sent");
			}
			else{
				debug.err("Server responded "+req.status+" for sending "+type);
			}
		},function(e){
			debug.err("Exception while sending XHR for "+type);
		});
	}
};

var debug={
	log:function(text){
		debug.push("LOG",text);
	},
	err:function(text){
		debug.push("ERR",text);
	},
	wrn:function(text){
		debug.push("WRN",text);
	},
	push:function(tag,text){
		var area=document.getElementById("debug");
		area.textContent+="["+tag+"] "+text+"\n";
		area.scrollTop=area.scrollHeight;
	},
	dumpMoves:function(){
		var debugString="";
		for(var i=0;i<tictac.local.moves.length;i++){
			debugString+="["+(i+1)+"] "+tictac.local.moves[i].player+": "+tictac.local.moves[i].outer+"."+tictac.local.moves[i].inner+"\n";
		}
		window.alert(debugString);
	}
};

function Move(outer,inner,player){
	this.outer=parseInt(outer);
	this.inner=parseInt(inner);
	this.player=player;
	this.same=function(other){
		return (other.outer==this.outer)&&(other.inner==this.inner);
	}
}