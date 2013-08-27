<?php
	$retVal["status"]="Internal Error";
	$retVal["code"]=-1;
	
	//TODO enforce max length on all user supplied data
		/*
			Iterate over all keys in posted data
			Err out if too long
		*/
	
	//parse input to json
	$http_raw=file_get_contents("php://input");
	
	if(!empty($http_raw)){
		$input=json_decode($http_raw,true);
	}
	else{
		$retVal["status"]="No parameters supplied";
		die(json_encode($retVal));
	}
	
	if($input===null){
		$retVal["status"]="Could not decode posted JSON";
		die(json_encode($retVal));
	}
	
	if(empty($input["auth"]["name"])||empty($input["auth"]["secret"])||empty($input["auth"]["session"])){
		$retVal["status"]="Missing credentials";
		die(json_encode($retVal));
	}

	$retVal["player"]=$input["auth"]["name"]."!".md5(hash("sha256",$input["auth"]["secret"].$input["auth"]["name"]));
	if(!empty($input["game"]["id"])){
		$retVal["handle"]=hash("sha256",$input["auth"]["session"].$input["game"]["id"].$retVal["player"]);
	}
	else{
		$retVal["handle"]="invalid handle";
	}
	
	//open db
	$db=new PDO("sqlite:/var/www/tictac/tictac.db3");
	

	//get messages
	if(isset($_GET["get"])){
		//query all messages for this id & gid
		
		$GET_STMT=$db->prepare("SELECT * FROM messages WHERE receiver=:target LIMIT 50");
		$DEL_STMT=$db->prepare("DELETE FROM messages WHERE msgid=:msg");
		$failTrans=false;
		
		$db->beginTransaction();
			$state=$GET_STMT->execute(array($retVal["handle"]));
			if($state){
				//fetch rows
				$ROW=$GET_STMT->fetch(PDO::FETCH_ASSOC);
				while($ROW!==FALSE){
					//execute delete
					$state=$DEL_STMT->execute(array($ROW["msgid"]));
					$DEL_STMT->closeCursor();
					if(!$state){
						$retVal["status"]="Could not delete message ".$ROW["msgid"];
						$failTrans=true;
						break;
					}
					//build array
					$msg["sender"]=$ROW["sender"];
					$msg["type"]=$ROW["type"];
					$msg["data"]=json_decode($ROW["data"],true);
					$retVal["messages"][]=$msg;
					$ROW=$GET_STMT->fetch(PDO::FETCH_ASSOC);
				}
			}
			else{
				$retVal["status"]="Could not fetch messages";
				$failTrans=true;
			}
			$GET_STMT->closeCursor();
		if($failTrans){
			$db->rollBack();	
		}
		else{
			$db->commit();
			$retVal["status"]="Messages fetched for ".$retVal["handle"];
			$retVal["code"]=1;
		}
	}
	
	//create game
	if(isset($_GET["gid"])){
		$retVal["game"]["id"]=mt_rand();
		$retVal["game"]["target"]=hash("sha256",$input["auth"]["session"].$retVal["game"]["id"].$retVal["player"]);
		
		$retVal["code"]=1;
		$retVal["status"]="Generated Game Identifier";
	}	
	
	//push status query
	if(isset($_GET["getstate"])){
		if(!empty($input["game"]["target"])&&!empty($input["game"]["id"])){
			storeMessage($retVal["handle"], $input["game"]["target"], "getstate", json_encode(array('hashname'=>$retVal["player"])));
		}
		else{
			$retVal["status"]="No target specified";
		}
	}
	
	if(isset($_GET["pushstate"])){
		//(game:id)
		//(to)
		//(meta:current|x|o)
		//[moves]
		
		//validate posted json
		if(!(empty($input["game"]["id"])||empty($input["to"]))){
			if(!(empty($input["meta"]["currentplayer"])||empty($input["meta"]["player_x"])||empty($input["meta"]["player_o"]))){
				//TODO validate move array
				
				storeMessage($retVal["handle"], $input["to"], "pushstate", json_encode(array('game'=>$input["game"],'meta'=>$input["meta"])));
			}
			else{
				$retVal["status"]="Meta info incomplete";
			}
		}
		else{
			$retVal["status"]="No target/GID specified";
		}
	}
	
	if(isset($_GET["move"])){
		//to
		//game
		//move
		
		//check outer parameters
		if(!(empty($input["game"]["id"])||empty($input["to"]))){
			//check move parameter
			if(empty($input["move"]["inner"])||empty($input["move"]["outer"])||empty($input["move"]["player"])){
				$retVal="Move structure invalid";
			}
			else{
				storeMessage($retVal["handle"], $input["to"], "move", json_encode(array('game'=>$input["game"],'move'=>$input["move"])));
			}
		}
		else{
			$retVal["status"]="No target/GID specified";
		}
	}

	print(json_encode($retVal));
	
	function storeMessage($sender, $receiver, $type, $data){
		global $db;
		global $retVal;
		
		$STMT=$db->prepare("INSERT INTO messages (sender,time,receiver,type,data) VALUES (:from, :time, :to, :type, :data)");
		if($STMT===FALSE){
			$retVal["status"]="Failed to prepare statement";
		}
		else{					
			$state=$STMT->execute(
				array(	':from'	=>$sender,
						':time'	=>time(),
						':to'	=>$receiver,
						':type'	=>$type,
						':data'	=>$data
				));
			if($state===FALSE){
				$err=$STMT->errorInfo();
				$retVal["status"]="DB Failed: ".$err[2];
			}
			else{
				$retVal["code"]=1;
				$retVal["status"]="Message sent";
			}
			$STMT->closeCursor();
		}
	}
?>