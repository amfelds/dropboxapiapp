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
	    $("#notLoggedInUI").hide();
	    $("#loggedInUI").show();
	}
	// end copy/paste from dropbox developer tutorial
	
	var testAdd = function() {
		alert("add recipe stub method to call!");
	};
	
	document.getElementById("dropboxAuthLink").onclick = function () {
		client.authenticate();
	};
	
	document.getElementById("testAddRecipe").onclick = function () {
		return testAdd();
	};
};