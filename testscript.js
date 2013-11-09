// Insert your Dropbox app key here:
var HOME_URL = 'http://localhost:8000/dropbox/dropboxapiapp/bootstrap-home.html'

// Exposed for easy access in the browser console.
var recipeTable = [];
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

	// Insert a new task record into the table.
	function insertRecipe(id, url, name) {
		recipeTable.push({ id: id,
			recipename: name,
			link: url,
		});
	}
	
	// updateList will be called every time the table changes.
	function updateList() {
		$('#recipeList').empty();

		// Add an item to the list for each task.
		for (var i = 0; i < recipeTable.length; i++) {
			var record = recipeTable[i];
			$('#recipes').append(
				renderListRecipe(record.id,
					record.recipename,
					record.link
				)
			);
		}

		addListeners();
		$('#newRecipe').focus();
	}
	
	// updateItem will be called when a specific item is clicked
	function updateItem(i) {
		$('#recipeItem').empty();
		
		var record = recipeTable[i];
		
		$('#recipeItem').append(
			renderSingleRecipe(record.id,
					record.recipename,
					record.link
				)
			);
	}

	insertRecipe("0", "resources/img/fraser_sunset.jpg", "Fraser Sunset");
	insertRecipe("1", "resources/img/greece.jpg", "Greece");
	insertRecipe("2", "resources/img/holi.jpg", "Holi");
	insertRecipe("3", "resources/img/kevpaulame.jpg", "Kevin, Paula, and Me");
	
	// Populate the initial task list.
	updateList();
		
	queryParams = getUrlVars();
	
	// Condition A: This is a "post" query (likely coming from a bookmarklet)
	if (queryParams['url'] !== undefined) {
		alert("Post stub");
		//TODO: get the url, title, and image(s) (if it/they exist)
		//TODO: Give the user some UI to edit content and save to Dropbox
		//TODO: On "save," get the url, title, and image (if there is one), save to datastore
		//TODO: then, redirect user back to the url (or window.location.href = back?"
	}
	// Condition B: This is a "select" query. Show the selected recipe.
	else if (queryParams['id'] !== undefined) {
		var i = queryParams['id'];
		var record = recipeTable[i];
		console.log(record);
		var recordname = record.recipename;
		var recordlink = record.link;
		$('#selectedRecipe').append(
				renderItemRecipe(i,recordname,recordlink)
			);
			
		$('#loggedInListUI').hide();
		$('#loggedInItemUI').show();
	}
	// Condition C: No supported parameters present. Show home page with list of recipes.
	else {
		$('#loggedInListUI').show();
		$('#loggedInItemUI').hide();
	} 
	
	// Render the HTML for a single task.
	function renderListRecipe(id, name, url) {
		return $('<div>').attr('id', id).append(
				$('<img>').attr('src', url).addClass('recipeCardPic')
			).append(
				$('<p>').html(name).addClass('recipeCardTitle')
			)
			.addClass('recipeCard');
	}
	
	function renderItemRecipe(id, recipename, imgurl) {
		return $('<div>').append(
			$('<h1>').html(recipename)
			).append(
				$('<img>').attr('src', imgurl)
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
			window.location.href = (window.location.href).split('?')[0];
		});
				
	}
	
	// Hook form submit and add the new task.
	$('#testAddRecipe').submit(function (e) {
		alert("submit stub");
	});
	
});