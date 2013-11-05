// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;


$(function () {
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
	
	// updateList will be called every time the table changes.
	function updateList() {
		$('#recipes').empty();

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
			console.log(record);
			$('#recipes').append(
				renderRecipe(record.getId(),
					record.get('recipename'),
					record.get('link'),
					record.get('created'),
					record.get('imageurl')
				)
			);
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
		$('#loggedInListUI').show();

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
		console.log(name);
		return $('<div>').attr('id', id).append(
				$('<img>').attr('src', imgsrc).addClass('recipeCardPic')
			).append(
				$('<p>').html(name).addClass('recipeCardTitle')
			)
			.addClass('recipeCard');
	}
	
	// Register event listeners to handle completing and deleting.
	function addListeners() {
		$('.recipeCard').click(function (e) {
			e.preventDefault();
			var div = $(this);
			var id = div.attr('id');
			navToRecipe(id);
		});
		
		$('#homeHeader').click(function (e) {
			//e.preventDefault();
			var urlSplit = (window.location.href).split('?');
			if (urlSplit.length > 1) {
				window.location.href = urlSplit(0);
			}
			$('#loggedInItemUI').hide();
			$('#loggedInListUI').show();
		});
				
	}
	
	// This function is from http://snipplr.com/view/19838/get-url-parameters/
	function getUrlVars() {
		var map = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			map[key] = value;
		});
		return map;
	}
	
	function navToRecipe(id) {
		window.location.href = (window.location.href).split('?')[0] + "?id=" + id;
		
		$('#loggedInListUI').hide();
		$('#loggedInItemUI').show();
	}
	
	// Hook form submit and add the new task.
	$('#testAddRecipe').submit(function (e) {
		e.preventDefault();
		if ($('#newRecipeName').val().length > 0) {
			insertRecipe($('#newRecipeUrl').val(),
						$('#newRecipeName').val(),
						$('#newRecipeImgSrc').val(),
						$('#newRecipeText').val()
			);
			$('#newRecipeUrl').val('');
			$('#newRecipeName').val('');
			$('#newRecipeImgSrc').val('');
			$('#newRecipeText').val('');
		}
		return false;
	});
	
});