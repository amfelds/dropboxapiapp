
var recipeTable = [];


$(function () {

	// TODO: check the query string of the url (or lack thereof) and run script accordingly



	// Insert a new task record into the table.
	function insertRecipe(id, url, name) {
		recipeTable.push({ id: id,
			recipename: name,
			link: url,
		});
	}
	
	// updateList will be called every time the table changes.
	function updateList() {
		$('#recipes').empty();

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
	
	insertRecipe("1", "resources/fraser_sunset.jpg", "Fraser Sunset");
	insertRecipe("2", "resources/greece.jpg", "Greece");
	insertRecipe("3", "resources/holi.jpg", "Holi");
	insertRecipe("4", "resources/kevpaulame.jpg", "Kevin, Paula, and Me");
	
	// Populate the initial task list.
	updateList();
	
	// Render the HTML for a single task.
	function renderListRecipe(id, name, url) {
		return $('<div>').attr('id', id).append(
				$('<img>').attr('src', url).addClass('recipeCardPic')
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
			
			// get recipe record
			var record;
			var i=0;
			var foundRecord = false;
			while (!foundRecord && i<recipeTable.length) {
				if (recipeTable[i].id === id) {
					foundRecord = true;
					record = recipeTable[i];
				}
				i++;
			}
			
			window.location.href = (window.location.href).split('?')[0] + "?id=" + id;
			
			$('#loggedInItemUI').show();
			$('#loggedInListUI').hide();
			
			$('#selectedRecipe').append(
				renderItemRecipe(record.id,
					record.recipename,
					record.link
				)
			);
		});
		
		$('#homeHeader').click(function (e) {
			e.preventDefault();
			window.location.href = (window.location.href).split('?')[0];

			$('#loggedInItemUI').hide();
			$('#loggedInListUI').show();
			//updateList();
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
	
	function renderItemRecipe(id, recipename, imgurl) {
		return $('<div>').append(
			$('<img>').attr('src', imgurl));
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