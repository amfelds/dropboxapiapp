var hi = function () {
	var hrefString = 'http://localhost:8000/dropbox/dropboxapiapp/save.html?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title);
	var allImgs = document.getElementsByTagName('img');
	var biggestImg = 0;
	var biggestImgSize = allImgs[0].width * allImgs[0].height;
	
	for (var i = 1; i < allImgs.length; i++) {
		if ((allImgs[i].width * allImgs[i].height) > biggestImgSize) {
			biggestImg = i;
			biggestImgSize = allImgs[i].width * allImgs[i].height;
		}
	}
		
	var imgUrl = encodeURIComponent(allImgs[biggestImg].src);
	hrefString = hrefString.concat('&img='+imgUrl);
		
	location.href = hrefString;
}();

