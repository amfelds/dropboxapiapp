window.onload = function () {
		
	// Copy/pasted to create a dropbox client 
	// from <https://www.dropbox.com/developers/datastore/tutorial/js>
	var client = new Dropbox.Client({key: "8np8mfweu7hax9b"});

	// Try to finish OAuth authorization.
	client.authenticate({interactive: false}, function (error) {
	    if (error) {
	        alert('Authentication error: ' + error);
	    }
	});

	if (client.isAuthenticated()) {
	    // Client is authenticated. Display UI.
	}
	
	document.getElementById("dropboxAuthLink").onclick = function () {
		client.authenticate();
	};
};