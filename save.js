// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';
var HOME_URL = 'http://localhost:8000/dropbox/dropboxapiapp/cookit.html'

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;
var queryParams;
var urlToSave = "";
var titleToSave;
var imageToSave = "";

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
	
	function updateUI(url, title, img) {
		$('#postForm').show();
		$('#saveForm').hide();

		$('#urlToPost').html(url);
		$('#titleToPost').html(title);
		$('#imgToPost').attr('src',img);
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
		$('#notLoggedInContainer').hide();
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
				titleToSave = decodeURIComponent(queryParams['title']);
				imageToSave = decodeURIComponent(queryParams['img']);
				
				//TODO: image(s) (iff it/they exist)
				
				updateUI(urlToSave, titleToSave, imageToSave);
			}
			// Condition C: No supported parameters present. Show save form.
			else {
				$('#saveForm').show();
				$('#postForm').hide();
				$('#urlToSave').focus();
			} 
		
			addListeners();
		});
	}
	else {
		$('#notLoggedInContainer').show();
	}
	
	// Render the HTML for a sidebar navigation item
	function renderSaveUI(title, url) {
		return $('<div>').append(
			$('<h5>').html('URL').append($('<p>').html(url))
		).append(
			$('<h5>').html('Title')
		).append(
			$('<textarea>').html(title).attr('id','titleToPost')
		).append($('<br>')).append(
			$('<button>').attr('id','bookmarkletPost').addClass('btn btn-large btn-primary').html('Save to Dropbox')
		);
	}
        
	// Register event listeners to handle completing and deleting.
	function addListeners() {
	}
	
	// Hook form submit and add the new task.
	$('#saveForm').submit(function (e) {
		e.preventDefault();
		urlToSave = $('#urlToSave').val();
		titleToSave = $('#titleToSave').val();
		var imageToSave = $('#imageToSave').val();
		
		insertRecipe(urlToSave,titleToSave,imageToSave,imageToSave);
		
		$('#manualSaveButton').html('Saving...');
		setTimeout(function() {
			$('#manualSaveButton').html('Success!');
		},2000);
		setTimeout(function () {
			$('#urlToSave').val('');
			$('#titleToSave').val('');
			$('#imageToSave').val('');
			$('#manualSaveButton').html('Save to Dropbox');
		},1000);
		
		$('#urlToSave').focus();
		
		//TODO create iframe of url to get title and img
		return false;
	});
	
	$('#postForm').submit(function (e) {
		e.preventDefault();
		$('#bookmarkletPostButton').html('Saving...');
		
		titleToSave = $('#titleToPost').val();
		insertRecipe(urlToSave,titleToSave,imageToSave,'');
		
		setTimeout(function() {
			$('#bookmarkletPostButton').html('Success! Redirecting...');
		},2000);
		setTimeout(function () {
			window.location.href = urlToSave;
		},3000);		
	});
	
});