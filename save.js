// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';
var HOME_URL = 'http://localhost:8000/dropbox/dropboxapiapp/bootstrap-home.html'

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;
var queryParams;
var urlToSave = "";
var titleToSave;

var monthMap = {0: 'January',
	1: 'February',
	2: 'March',
	3: 'April',
	4: 'May',
	5: 'June',
	6: 'July',
	7: 'August',
	8: 'September',
	9: 'October',
	10: 'November',
	11: 'December'}

$(function () {
	// This function is from http://snipplr.com/view/19838/get-url-parameters/
	function getUrlVars() {
		var map = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			map[key] = value;
		});
		return map;
	}

	// The login button will start the authentication process.
	$('#loginButton').click(function (e) {
		e.preventDefault();
		// This will redirect the browser to OAuth login.
		client.authenticate();
	});

	// Insert a new task record into the table.
	function insertRecipe(url, name, imgsrc, text) {
		recipeTable.insert({
			recipename: name,
			link: url,
			created: new Date(),
			imageurl: imgsrc,
			text: text
		});
	}
	
	function updateUI(url, title) {
		$('#saveForm').empty();
		$('#saveForm').append(
			renderSaveUI(title, url)
		);
		addListeners();
	}
		
	// The login button will start the authentication process.
	$('#loginButton').click(function (e) {	
		e.preventDefault();
		// This will redirect the browser to OAuth login.
		client.authenticate();
	});
	
	// Try to finish OAuth authorization.
	client.authenticate({interactive:false}, function (error) {
		if (error) {
			alert('Authentication error: ' + error);
		}
	});
	
	if (client.isAuthenticated()) {
		// Client is authenticated. Display UI (conditional on query params)
		client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
			if (error) {
				alert('Error opening default datastore: ' + error);
			}

			$('#loggedInContainer').show();
			
			recipeTable = datastore.getTable('recipes');
			
			queryParams = getUrlVars();
			// Condition A: This is a "post" query (likely coming from a bookmarklet)
			if (queryParams['url'] !== undefined) {
				urlToSave = decodeURIComponent(queryParams['url']);
				var titleToSave = decodeURIComponent(queryParams['title']);
				var images = queryParams['images'];
				//TODO: image(s) (if it/they exist)
				
				updateUI(urlToSave, titleToSave);
				//TODO: Give the user some UI to edit content and save to Dropbox
				
				//TODO: On "save," get the url, title, and image (if there is one), save to datastore (call insertRecipe)
				//TODO: then, redirect user back to the url (or window.location.href = back?"
			}
			// Condition C: No supported parameters present. Show save form.
			else {
				// TODO: show regular save form
			} 
		
			addListeners();
		});
	}
	
	// Render the HTML for a sidebar navigation item
	function renderSaveUI(title, url) {
		return $('<div>').append(
			$('<h5>').html('URL').append($('<p>').html(url))
		).append(
			$('<h5>').html('Title')
		).append(
			$('<textarea>').html(title)
		).append($('<br>')).append(
			$('<button>').attr('id','bookmarkletSubmit').addClass('btn btn-large btn-primary').attr('type','submit').html('Save to Dropbox')
		);
	}
        
	// Register event listeners to handle completing and deleting.
	function addListeners() {
// 		$('#bookmarkletSubmit').click(function (e) {
// 			e.preventDefaults();
// 		});
	}
	
	// Hook form submit and add the new task.
	$('#saveForm').submit(function (e) {
		e.preventDefault();
		if (urlToSave.length <= 0) {
			urlToSave = $('#urlToSave').val();
		}
		if (titleToSave) {
			insertRecipe(urlToSave, titleToSave, '', '');
		}
		else {
			insertRecipe(urlToSave,'Blank','',''
			);
			$('#urlToSave').val('');
		}
		return false;
	});
	
});