/**
	The awesome	
	CodeBlue pseudo-cross-browser XHR/AJAX Code Library
	
	DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
	Version 2, December 2004 

	Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 
			
		Everyone is permitted to copy and distribute verbatim or modified 
		copies of this license document, and changing it is allowed as long 
		as the name is changed. 
		
	DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
	TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

		0. You just DO WHAT THE FUCK YOU WANT TO.
*/

var ajax={
	/**
		Create a XHR Object on most browsers (hopefully)
		Partly modified from 
		http://www.javascriptkit.com/dhtmltutors/ajaxgetpost.shtml
	*/
	ajaxRequest:function(){
		var activexmodes=["Msxml2.XMLHTTP","Microsoft.XMLHTTP"];//activex shit. i dont even.
		if(window.ActiveXObject){//yay for ie!
			for (var i=0;i<activexmodes.length;i++){
				try{
					return new ActiveXObject(activexmodes[i]);
				}
				catch(e){
					//suppress error
				}
			}
		}
		else if (window.XMLHttpRequest){//every sane browser, ever.
			return new XMLHttpRequest();
		}
		else{
			return false;
		}
	},
	
	/**
		Make an asynchronous GET request
		Calls /readyfunc/ with the request as parameter upon completion (readyState == 4)
	*/
	asyncGet:function(url,readyfunc,errfunc){
		var request=new this.ajaxRequest();
		request.onreadystatechange=
			function(){
				if (request.readyState==4){
					readyfunc(request);
				}
			};
			
		request.open("GET",url, true);
		try{
			request.send(null);
		}
		catch(e){
			errfunc(e);
		}
		return request;
	},
	
	/**
		Make an asynchronous POST request
		Calls /readyfunc/ with the request as parameter upon completion (readyState == 4)
		
		/payload/ should contain the data to be POSTed in standard format, that is
		"foo=bar&baz=oof", encodeURI' the values as needed.
	*/
	asyncPost:function(url,payload,readyfunc,errfunc){
		var request=new this.ajaxRequest();
		request.onreadystatechange=
			function(){
				if (request.readyState==4){
					readyfunc(request);
				}
			};
			
		request.open("POST", url, true);
		request.setRequestHeader("Content-type", "application/json");
		try{
			request.send(payload);
		}
		catch(e){
			errfunc(e);
		}
		return request;
	},
	
	/**
		Perform a synchronous GET request
		This function does not do any error checking, so exceptions might
		be thrown.
	*/
	syncGet:function(url){
		var request=new this.ajaxRequest();
		request.open("GET", url, false);
		request.send(null);
		return request;
	},
	
	/**
		Perform a synchronous POST request, with /payload/
		being the data to POST in standard format.
	*/
	syncPost:function(url, payload){
		var request=new this.ajaxRequest();
		request.open("POST", url, false);
		request.setRequestHeader("Content-type", "application/json");
		request.send(payload);
		return request;
	}
}





