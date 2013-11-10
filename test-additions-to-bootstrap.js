// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';
var HOME_URL = 'http://localhost:8000/dropbox/dropboxapiapp/home.html'

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;
var queryParams;

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
	
	// updateList will be called every time the table changes.
	function updateList() {
		$('#recipeListDisplay').empty();

		var records = recipeTable.query();

		// Sort by creation time.
		records.sort(function (recipeA, recipeB) {
			if (recipeA.get('created') < recipeB.get('created')) return -1;
			if (recipeA.get('created') > recipeB.get('created')) return 1;
			return 0;
		});

		// Sort the recipes into log-scale reverse-chronological buckets
		// (remember getMonth() >> 0 is January)
		var monthBuckets = [];
		var yearBuckets = [];
		var currDate = new Date();
		var c = 0;
		while (c < records.length) {
			var record = records[c];
			// if it's this year, put it into a month bucket
			if (record.get('created').getYear() === currDate.getYear()) {
				// create a bucket 
				var currbucket = [];
				var currmonth = record.get('created').getMonth();
				while (c < records.length && record.get('created').getMonth() === currmonth) {
					currbucket.push(record);
					c++;
					record = records[c];
				}
				monthBuckets.push(currbucket);
			}
			// if it's a former year, put it into a year bucket
			else {
				var currbucket = [];
				var curryear = records.get('created').getYear();
				while (c < records.length && record.get('created').getYear() === curryear) {
					currbucket.push(record);
					c++;
					record = records[c];
				}
				yearBuckets.push(currbucket);
			}
		}
		
		// Add elements to the sidebar list for each month bucket
		for (var i = 0; i < monthBuckets.length; i++) {
			var bucket = monthBuckets[i];
			var monthNum = bucket[0].get('created').getMonth();
			var monthString = monthMap[monthNum];
			$('#navHomeSideBar').append(
				renderSidebarNav(monthString)
			);
			for (var j = 0; j < bucket.length; j++) {
				var record = bucket[j];
			}
		}
		
// TODO: Add elements to the sidebar list for each year	
// 		for (var i = 0; i < yearBuckets.length; i++) {
// 			var bucket = yearBuckets[i];
// 			var yearString = bucket[0].get('created').getUTCFullYear();
// 			$('#navHomeSideBar').append(
// 				renderSidebarHeader(yearString);
// 			);
// 		}
		
		// Add the most recent 15 recipes (of this month) to the recipeListDipslay block
		// TODO

		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			console.log(record);
			$('#recipeListDisplay').append(
				renderListRecipe(record.getId(),
					record.get('recipename'),
					record.get('imageurl'))
			);
		}

		addListeners();
		// TODO: is this needed? $('#newRecipe').focus();
	}
	
	// updateItem will be called when a specific item is clicked
	function updateItem(queryID) {
		var recipeToShow = recipeTable.query({id: queryID});
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
				//TODO: get the url, title, and image(s) (if it/they exist)
				//TODO: Give the user some UI to edit content and save to Dropbox
				//TODO: On "save," get the url, title, and image (if there is one), save to datastore
				//TODO: then, redirect user back to the url (or window.location.href = back?"
			}
			// Condition B: This is a "select" query. Show the selected recipe.
			else if (queryParams['id'] !== undefined) {
				var queryID = queryParams['id'];
				var record = recipeTable[queryID];
				console.log(record);
				var recordname = record.recipename;
				var recordlink = record.link;
				$('#selectedRecipe').append(
					renderItemRecipe(queryID,recordname,recordlink)
				);
				$('#loggedInListUI').hide();
				$('#loggedInItemUI').show();
			}
			// Condition C: No supported parameters present. Show home page with list of recipes.
			else {
				$('#loggedInContainer').show();
				$('#notLoggedInContainer').hide();
				
				// Populate the recipe list
				updateList();
				
				// Ensure that future changes update the list.
				datastore.recordsChanged.addListener(updateList);
			} 
		});
	}
	
	// Delete the record with a given ID.
	function deleteRecord(id) {
		recipeTable.get(id).deleteRecord();
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
		alert('renderSelectedRecipe stub');
		// TODO
// 		return $('<div>').attr('id', id).append(
// 				$('<img>').attr('src', url).addClass('recipeCardPic')
// 			).append(
// 				$('<p>').html(name).addClass('recipeCardTitle')
// 			)
// 			.addClass('recipeCard');
	}
	
	// Render the HTML for a list entry
	function renderListRecipe(id, recipename, imgurl) {
		return $('<div>').addClass('span4').append(
				$('<h2>').html(recipename)
			).append(
				$('<p>').append($('<img>').attr('src', imgurl))
			).append(
				$('<p>').append($('<a>').attr('href','#').addClass('btn').html('View details &raquo;'))
			);
	}
        
	// Register event listeners to handle completing and deleting.
	function addListeners() {
// TODO: is it recipeCard? or is it the "show more" button?		
		$('.recipeCard').click(function (e) {
			e.preventDefault();
			var div = $(this);
			var id = div.attr('id');
			window.location.href = (window.location.href).split('?')[0] + "?id=" + id;	
		});
		
// TODO: are there delete buttons?		
		$('button.delete').click(function (e) {
			e.preventDefault();
			var id = $(this).parents('div').attr('id');
			deleteRecord(id);
		});
		
// TODO: is it homeHeader?		
		$('#homeHeader').click(function (e) {
			e.preventDefault();
			window.location.href = HOME_URL;
		});
				
	}
	
	// Hook form submit and add the new task.
// TODO: does it save the recipe title and all that? or just the url?	
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