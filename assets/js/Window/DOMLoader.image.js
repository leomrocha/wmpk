/*

	DOMLoader.image - Cross-Origin Resource Sharing (CORS)
	-------------------------------------------------------
	requires; DOMLoader.XMLHttp
	-------------------------------------------------------
	(1) Image.crossOrigin; Firefox 9+ and Chrome 13+
	(2) XMLHttpRequest.withCredentials; implemented in Firefox 3.5+, Safari 4+, and Google Chrome.
	(3) PHP - getImage.php
	(4) Google App Engine - $.getImageData
	(5) UniversalXPConnect (firefox extensions)
	-------------------------------------------------------
	DOMLoader.sendRequestBase64({
		JS64: true // fun option ;)
	});
	-----
	DOMLoader.image({
		onprogress: function() { } // forces XMLHttpRequest
	});
	
*/

if (typeof(DOMLoader) === "undefined") var DOMLoader = {};

(function() { "use strict";

// cache browser supports of cors
var cors2d;
// a 1x1 pixel image on a server supporting cors
var corsTestURL = "https://lh4.googleusercontent.com/-Qw7nlh9DWec/TvV5qTZ9yfI/AAAAAAAADOA/XdalA5bQBOY/s128/1x1.png";
// tested hosts for cors credentials
var hostCredentials = {};

DOMLoader.image = function(config) {
	var image = new Image();
	// use XMLHttpRequest with cors to get the image
	var sendRequestBase64 = function() {
		var src = config.src;
		return DOMLoader.sendRequestBase64({
			url: src,
			onerror: function(event) {
				imageLoader(3);
				hostCredentials[ahref.host] = 3;
			},
			oncallback: function(response) {
				if (!response) return;
				var ext = src.split(".").pop();
				config.src = "data:image/" + ext + ";base64," + response.responseText;
				imageLoader(0);
				hostCredentials[ahref.host] = (cors2d === true) ? 1 : 0;
			}, 
			onprogress: config.onprogress
		});
	};
	// tests for cors/base64 support or defaults to proxy
	var imageLoader = function(cors) { // 0 = base64, 1 = full, 2 = xml, 3 = proxy
		image.onload = config.callback;
		//
		switch(cors) {
			case 0: // base64 object
				image.src = config.src;
				break;
			case 1: // full cors
				image.crossOrigin = "anonymous";
				image.src = config.src;
				break;
			case 2: // xmlrequest
				sendRequestBase64();
				break;
			case 3: // fallback on php proxy
				if ($vars.host.substr(0, 6) === "chrome") {
					/// imageToJson from Max Novakovic's getImageData library.
					//  http://www.maxnov.com/getimagedata/
					var proxyString = "http://img-to-json.appspot.com/?callback=DOMLoader.imageToJson&url=";
					DOMLoader.imageToJson = function(response) {
						image.onload = config.callback;
						image.src = response.data;
					};
					DOMLoader.script.add({
						src: proxyString + escape(config.src)
					});
				} else { // local-server
					var proxyString = $vars.host + "/software/inc/getImage.php?url=";
					image.src = proxyString + escape(config.src);
				}
				break;
		}
	};
	// detect whether server supports cors on XMLRequest (header)
	var detectCORS = function() {
		var src = config.src;
		// Base64 content; same domain policy applies, no need for cors.
		if (src.substr(0, 10) === "data:image") {
			return imageLoader(0);
		} else if (config.onprogress) { // requires XMLHttpRequest to show progress
			return sendRequestBase64();
		}
		// gather the credentials of the host - 1st load to host is base64 request always
		var credentials = hostCredentials[ahref.host];
		if (typeof(credentials) !== "undefined") { // host already tested
			return imageLoader(credentials);
		}
		// Fallback on php proxy or XMLRequest (browser doesn't support cors2d)
		if (cors2d === false) { // no support for image.crossOrigin
			try { // ie throws an error, so needs to be in try/catch
				var hasCredentials = "withCredentials" in req;
			} catch(e) { // nope
				var hasCredentials = false;
			}
			if (!hasCredentials) { // fallback to php proxy
				return imageLoader(3);
			} else { // has credential XMLRequest support-neat!
				return sendRequestBase64();
			}
		}
		// record credentials of host, and send request for base64 png data
		// we're only required to do this once... but can continue, if we want onprogress support
		return sendRequestBase64();
	};
	// test for base64
	if (config.src.substr(0, 10) === "data:image") {
		return imageLoader(0);
	}
	// write src to ahref to capture the host
	var ahref = document.createElement("a");
	ahref.href = config.src;
	// detect whether server supports cors
	if (typeof (cors2d) !== "undefined") { // cache
		return detectCORS(cors2d);
	}
	// detect + cache cors browser supports on 2d objects
	var idetect = new Image();
	idetect.crossOrigin = "anonymous";
	idetect.onload = function() {
		var canvas = document.createElement("canvas")
		var ctx = canvas.getContext("2d");
		ctx.drawImage(idetect, 0, 0);
		// lets attempt to getImageData from a foreign URL with known CORS support
		try { // the browser supports cors!
			ctx.getImageData(0, 0, 1, 1).data;
			detectCORS(cors2d = true);
		} catch(e) { // does not support cors... it might support base64request
			detectCORS(cors2d = false);
		}
	};
	idetect.src = corsTestURL;
	return image;
};

DOMLoader.sendRequestBase64 = function(config) {
	/// "encodeBinary" borrowed from Emil Lerch's article on the subject
	// http://emilsblog.lerch.org/2009/07/javascript-hacks-using-xhr-to-load.html
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var encodeBinary = function (input) {
		var output = "";
		var bytebuffer;
		var encodedCharIndexes = new Array(4);
		var inx = 0;
		var paddingBytes = 0;
		while (inx < input.length) {
			// Fill byte buffer array
			bytebuffer = new Array(3);
			for (jnx = 0; jnx < bytebuffer.length; jnx++)
			if (inx < input.length) bytebuffer[jnx] = input.charCodeAt(inx++) & 0xff; // throw away high-order byte, as documented at: https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
			else bytebuffer[jnx] = 0;
			// Get each encoded character, 6 bits at a time
			// index 1: first 6 bits
			encodedCharIndexes[0] = bytebuffer[0] >> 2;
			// index 2: second 6 bits (2 least significant bits from input byte 1 + 4 most significant bits from byte 2)
			encodedCharIndexes[1] = ((bytebuffer[0] & 0x3) << 4) | (bytebuffer[1] >> 4);
			// index 3: third 6 bits (4 least significant bits from input byte 2 + 2 most significant bits from byte 3)
			encodedCharIndexes[2] = ((bytebuffer[1] & 0x0f) << 2) | (bytebuffer[2] >> 6);
			// index 3: forth 6 bits (6 least significant bits from input byte 3)
			encodedCharIndexes[3] = bytebuffer[2] & 0x3f;
			// Determine whether padding happened, and adjust accordingly
			paddingBytes = inx - (input.length - 1);
			switch (paddingBytes) {
			case 2:
				// Set last 2 characters to padding char
				encodedCharIndexes[3] = 64;
				encodedCharIndexes[2] = 64;
				break;
			case 1:
				// Set last character to padding char
				encodedCharIndexes[3] = 64;
				break;
			default:
				break; // No padding - proceed
			}
			// Now we will grab each appropriate character out of our keystring
			// based on our index array and append it to the output string
			for (jnx = 0; jnx < encodedCharIndexes.length; jnx++)
			output += _keyStr.charAt(encodedCharIndexes[jnx]);
		}
		return output;
	};
	// encapsulate the callback with a new callback
	var callback = config.onload;
	config.onload = function(response) {
		if (!response.responseText) return;
		var base64 = encodeBinary(response.responseText);
		if (config.JS64) { // script encoded as base64
			/// Original method borrowed from Jacob Seiden 
			// http://www.nihilogic.dk/labs/canvascompress/
			var file = "data:image/png;base64," + base64
			var oCanvas = document.createElement("canvas");
			var oCtx = oCanvas.getContext("2d");
			var oImg = new Image();
			oImg.onload = function() {
				var iWidth = this.offsetWidth;
				var iHeight = this.offsetHeight;
				oCanvas.width = iWidth;
				oCanvas.height = iHeight;
				oCanvas.style.width = iWidth+"px";
				oCanvas.style.height = iHeight+"px";
				var oText = document.getElementById("output");
				oCtx.drawImage(this, 0, 0);
				var oData = oCtx.getImageData(0,0,iWidth,iHeight).data;
				var a = [], len = oData.length, p = -1;
				for (var i=0;i<len;i+=4) {
					if (oData[i] > 0) a[++p] = String.fromCharCode(oData[i]);
				}
				var strData = a.join("");
				callback({ responseText: strData });
				document.body.removeChild(oImg);
			}
			oImg.src = file;
			return true;
		} else { // just some random image (nothing special)
			callback({ responseText: base64 });
		}
	};
	DOMLoader.sendRequest(config);
};

})();