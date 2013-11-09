// THIS IS THE FILE WHERE ALL THE DROPBOX API STUFF IS WORKING TO THE BEST OF MY ABILITIES


// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8np8mfweu7hax9b';
var HOME_URL = 'http://localhost:8000/dropbox/dropboxapiapp/home.html'

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var recipeTable;
var queryParams;

// TODO: make month string array
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
		
		var monthBuckets = [];
		var yearBuckets = [];
		var currDate = new Date();

		// Sort the recipes into log-scale reverse-chronological buckets
		// (remember getMonth() >> 0 is January)
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
		
		// Add an item to the list for each month/year bucket
		for (var i = 0; i < monthBuckets.length; i++) {
			var bucket = monthBuckets[i];
			var monthNum = bucket[0].get('created').getMonth();
			var monthString = monthMap[monthNum];
			$('#recipeList').append(
				renderMonthList(monthString)
			);
			for (var j = 0; j < bucket.length; j++) {
				var record = bucket[j];
				$('#recipeList').append(
					renderListItemRecipe(record.getId(),
						record.get('recipename'),
						record.get('link'),
						record.get('created'),
						record.get('imageurl')
					)
				);
			}
		}
		for (var i = 0; i < yearBuckets.length; i++) {
			var bucket = yearBuckets[i];
		}

		// Add an item to the list for each recipe.
// 		for (var i = 0; i < records.length; i++) {
// 			var record = records[i];
// 			$('#recipeList').append(
// 				renderListItemRecipe(record.getId(),
// 					record.get('recipename'),
// 					record.get('link'),
// 					record.get('created'),
// 					record.get('imageurl')
// 				)
// 			);
// 		}

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
	
	// Delete the record with a given ID.
	function deleteRecord(id) {
		recipeTable.get(id).deleteRecord();
		// TODO: maybe make a temporary div to undo the delete?
	}
	
	// Render the HTML for a month group
	function renderMonthList(title) {
		return $('<h3>').html(title);
	}
	
	// Render the HTML for a recipe list item
	function renderListItemRecipe(id, name, url, date, imgsrc) {
		return $('<div>').attr('id', id).append(
			$('<div>').append(
					$('<img>').attr('src', imgsrc).addClass('recipeCardPic')
				).append(
					$('<p>').html(name).addClass('recipeCardTitle')
				).addClass('recipeCard')
			).append(
				$('<button>').addClass('delete').html('&times;')
			);
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
		
		$('button.delete').click(function (e) {
			e.preventDefault();
			var id = $(this).parents('div').attr('id');
			deleteRecord(id);
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