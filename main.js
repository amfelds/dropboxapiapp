// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;

$(function () {
	// Insert a new task record into the table.
	function insertRecipe(url, name, imgsrc, text) {
		recipeTable.insert({
			recipeName: name,
			link: url,
			created: new Date(),
			imageurl: imgsrc,
			text: text
		});
	}
	
	// updateList will be called every time the table changes.
	function updateList() {
		//$('#recipes').empty();

		var records = recipeTable.query();

		// Sort by creation time.
		records.sort(function (recipeA, recipeB) {
			if (recipeA.get('created') < recipeB.get('created')) return -1;
			if (recipeA.get('created') > recipeB.get('created')) return 1;
			return 0;
		});

		// Add an item to the list for each task.
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			$('#recipes').append(
				renderRecipe(record.getId(),
					record.get('recipename'),
					record.get('link'),
					record.get('created'),
					record.get('imageurl')));
		}

		addListeners();
		$('#newRecipe').focus();
	}
	
	// The login button will start the authentication process.
	$('#dropboxAuthLink').click(function (e) {
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
		// Client is authenticated. Display UI.
		$('#notLoggedInUI').hide();
		$('#loggedInUI').show();

		client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
			if (error) {
				alert('Error opening default datastore: ' + error);
			}

			recipeTable = datastore.getTable('recipes');

			// Populate the initial task list.
			updateList();

			// Ensure that future changes update the list.
			datastore.recordsChanged.addListener(updateList);
		});
	}
	
	// Render the HTML for a single task.
	function renderRecipe(id, name, url, date, imgsrc) {
		return $('<div>').attr('id', id).addClass('recipeCard');;
	}
	
	// Register event listeners to handle completing and deleting.
	function addListeners() {
	}
	
	// Hook form submit and add the new task.
	$('#testAddRecipe').submit(function (e) {
		e.preventDefault();
		if ($('#newRecipeName').val().length > 0) {
			insertRecipe($('#newRecipeUrl').val(),
						$('#newRecipeName').val(),
						$('#newRecipeImgSrc').val(),
						$('#newRecipeText').val());
			$('#newRecipeUrl').val('');
			$('#newRecipeName').val('');
			$('#newRecipeImgSrc').val('');
			$('#newRecipeText').val('');
		}
		return false;
	});
	
});