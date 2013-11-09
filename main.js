// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';
var HOME_URL = 'http://localhost:8000/dropbox/dropboxapiapp/home.html'

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;
var queryParams;


$(function () {
	alert('main.js is run!');

	// This function is from http://snipplr.com/view/19838/get-url-parameters/
	function getUrlVars() {
		var map = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			map[key] = value;
		});
		return map;
	}

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
		$('#recipeList').empty();

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
			$('#recipeList').append(
				renderListItemRecipe(record.getId(),
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
	
	// updateItem will be called when a specific item is clicked
	function updateItem(queryID) {
		$('#recipeItem').empty();
		
		var recipeToShow = recipeTable.query({id: queryID});
		
		$('#recipeItem').append(
			renderSingleRecipe(recipeToShow.getId(),
				recipeToShow.get('recipename'),
				recipeToShow.get('link'),
				recipeToShow.get('created'),
				recipeToShow.get('imageurl'),
				recipeToShow.get('text')
				)
			);
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
		// Client is authenticated. Display UI (conditional on query params)
		$('#notLoggedInUI').hide();
		
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
		
		queryParams = getUrlVars();
		
		if (queryParams['id'] === undefined) {
			$('#loggedInListUI').show();
			$('#loggedInItemUI').hide();
		} else {
			// TODO: updateItem()
			$('#loggedInListUI').hide();
			$('#loggedInItemUI').show();
		}
	}
	
	// Render the HTML for a recipe list item
	function renderListItemRecipe(id, name, url, date, imgsrc) {
		return $('<div>').attr('id', id).append(
				$('<img>').attr('src', imgsrc).addClass('recipeCardPic')
			).append(
				$('<p>').html(name).addClass('recipeCardTitle')
			)
			.addClass('recipeCard');
	}
	
	// Render the HTML for a selected recipe item
	function renderSingleRecipe(id, name, url, date, imgsrc, text) {
		return $('<div>').attr('id', 'fullrecipe'+id).append(
			$('<h2>').html(name)
		).append(
			$('<h3>').html("Saved on " + date)
		).append(
			$('<img>').attr('src', imgsrc)
		);
	}
	
	// Register event listeners to handle completing and deleting.
	function addListeners() {
		$('.recipeCard').click(function (e) {
			e.preventDefault();
			var div = $(this);
			var id = div.attr('id');
			window.location.href = (window.location.href).split('?')[0] + "?id=" + id;	
		});
		
		$('#homeHeader').click(function (e) {
			e.preventDefault();
			window.location.href = HOME_URL;
		});
				
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