/*
	DOM ELEMENT CALLBACKS
	--------------------------- 
	DOMLoader.link({
		href: "./fonts/Ultima.css",
		fontFamily: "Ultima", // if checking for <canvas>
		onload: function() { }
	});
	-------
	TODO: merge in onload code from Canvas Text library.
*/

if (typeof(DOMLoader) === "undefined") var DOMLoader = {};

(function() { "use strict";

DOMLoader.link = function(conf) {
	if (typeof(conf) === "string") conf = { href: conf };
	var hash = conf.href.replace(/[^a-zA-Z 0-9]+/g, "");
	if (!document.getElementById(hash)) {
		var link = document.createElement("link");
		link.href = conf.href;
		link.id = hash;
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		var head = document.getElementsByTagName("head")[0];
		if (!head) head = document.body;
		head.appendChild(link);
	}
};

})();