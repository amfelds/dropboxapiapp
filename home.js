// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';
var HOME_URL = 'http://localhost:8000/dropbox/dropboxapiapp/cookit.html'

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;
var queryParams;

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

	// Insert a new recipe record into the table.
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
		$('#recipeListDisplay').empty();

		var records = recipeTable.query();

		// Sort by creation time.
		records.sort(function (recipeA, recipeB) {
			if (recipeA.get('created') > recipeB.get('created')) return -1;
			if (recipeA.get('created') < recipeB.get('created')) return 1;
			return 0;
		});
		
		var parent;
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (i % 3 === 0) {
				parent = $('<div>').addClass('row-fluid');
				$('#recipeListDisplay').append(parent);
			}
			parent.append(
				renderListRecipe(record.getId(),
					record.get('recipename'),
					record.get('imageurl'))
				);
		}
	}
	
	// updateItem will be called when a specific item is clicked
	function updateItem(queryID) {
		var recipeToShow = recipeTable.get(queryID);
		$('#selectedRecipe').empty();
		$('#selectedRecipe').append(		
			renderSelectedRecipe(queryID, 
				recipeToShow.get('recipename'),
				recipeToShow.get('link')
			)
		);
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

			recipeTable = datastore.getTable('recipes');
			
			queryParams = getUrlVars();
			// Condition A: This is a "post" query (likely coming from a bookmarklet)
			if (queryParams['url'] !== undefined) {
				alert("Post stub");
			}
			// Condition B: This is a "select" query. Show the selected recipe.
			else if (queryParams['id'] !== undefined) {				
				$('#loggedInContainer').show();
			
				$('#loggedInListUI').hide();
				$('#loggedInItemUI').show();
			
				var queryID = queryParams['id'];
				updateItem(queryID);
			}
			// Condition C: No supported parameters present. Show home page with list of recipes.
			else {

				$('#loggedInContainer').show();
				$('#notLoggedInContainer').hide();
			
				$('#loggedInListUI').show();
				$('#loggedInItemUI').hide();
			
				// Populate the recipe list
				updateList();
			} 
			// Ensure that future changes update the list.
			datastore.recordsChanged.addListener(updateList);
			
			addListeners();
		});
	}
	
	// Delete the record with a given ID.
	function deleteRecord(id) {
		recipeTable.get(id).deleteRecord();
		window.location.href.replace(HOME_URL);
		// TODO: maybe make a temporary div to undo the delete?
	}
	
	// Render the HTML for a sidebar title item
	function renderSidebarHeader(title) {
		return $('<li>').html(title).addClass('nav-header');
	}
	
	// Render the HTML for a sidebar navigation item
	function renderSidebarNav(title) {
		return $('<li>').append(
			$('<a>').attr('href', '#').html(title)
		);
	}
	
	// Render the HTML for a selected recipe 
	function renderSelectedRecipe(id, name, url) {
		return $('<div>').append(
				$('<button>').addClass('btn').addClass('deleteSelect').html('Delete')
			).append(
				$('<a>').attr('href',url).attr('target','_blank').append(
					$('<h1>').html(name)
				)
			).append(
				$('<iframe>').attr('src',url).attr('style','width:100%;height:600px')
			);
	}
	
	// Render the HTML for a list entry
	function renderListRecipe(id, recipename, imgurl) {
		return $('<div>').attr('id',id).addClass('span4').addClass('recipeListSpan4').attr('style','background-image:url(' + imgurl + ');').append(
				$('<p>').append(
					$('<button>').addClass('delete').addClass('btn').html('&times;')
				)
			).append(
				$('<h4>').html(recipename).addClass('recipeListTitle')
			).append(
				$('<p>').append(
					$('<a>').attr('href','#').addClass('btn').addClass('selectRecipe').html('View recipe &raquo;')
				)
			);
	}
        
	// Register event listeners to handle completing and deleting.
	function addListeners() {
		$('.selectRecipe').click(function (e) {
			e.preventDefault();
			var div = $(this).parents('div');
			var id = div.attr('id');
			window.location.assign(HOME_URL + "?id=" + id);	
		});	

		$('button.delete').click(function (e) {
			e.preventDefault();
			var id = $(this).parents('div').attr('id');
			deleteRecord(id);
		});
		
		$('button.deleteSelect').click(function (e) {
			e.preventDefault();
			var id = $(this).parents('div').attr('id');
			deleteRecord(id);
			window.location.assign(HOME_URL);
		});
	}
	
});