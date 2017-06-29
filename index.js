var cool = require('cool-ascii-faces');
var express = require('express');
var htmlparser = require("htmlparser2");
var https = require('https'); 
const cheerio = require('cheerio');
var requestMe = require('request');
var iconv = require('iconv-lite');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/kategoriler', function(request, response) {

	var options = { 
	  // protocol: 'https:', --this isn't necessary
	  hostname: 'www.kumandatv.com', 
	  path: '/',
	};
	callback = function(response2) { 
	  var str = '';
	//  console.log('statusCode: ', response.statusCode); 
	//  console.log('headers: ', response.headers); 

	  response2.on('data', function(data){ 
	    str += data;
	  }); 

	  response2.on('end', function() {
	    


	const $ = cheerio.load(str,  { decodeEntities: false })

	//$('h2.title').text('Hello there!')
	//$('h2').addClass('welcome')
	//console.log($('.kumandatvmenu').text());

	//console.log($('ul').hasClass('kumandatvmenu'));
	//$('li[class=orange]').html()

	//console.log($.html('.kumandatvmenu'));

 

	var kategoriList =[];

	$('a').each(function() {
	    var text = $(this).text();
	    var link = $(this).attr('href');

	    if(link && link.match(/kategori/)){
	      	console.log(text + ' --> ' + link);
	      	var string = text.toUpperCase();

			var letters = { "İ": "i", "I": "i", "Ş": "s", "Ğ": "g", "Ü": "u", "Ö": "o", "Ç": "c" };
			string = string.replace(/(([İIŞĞÜÇÖ]))/g, function(letter){ return letters[letter]; })
			var resimLink = "https://firebasestorage.googleapis.com/v0/b/canlitvizle-7631a.appspot.com/o/" + string.toLowerCase() + ".png?alt=media&token=a315715a-d161-4bb3-9001-d050d8e239a5";
			//https://firebasestorage.googleapis.com/v0/b/canlitvizle-7631a.appspot.com/o/dini.png?alt=media&token=a315715a-d161-4bb3-9001-d050d8e239a5

	      	var kategoriObj = {kategori:text, kategoriLink:link, kategoriResim: resimLink, kanal: string.toLowerCase()};
	      	kategoriList.push(kategoriObj);
	    };
	  });

			console.log( kategoriList  );
	    	var kategoriObjStr = JSON.stringify(kategoriList);
	 		console.log( kategoriObjStr  );
	 		response.send(kategoriObjStr);
		});
	}

		var request = https.request(options, callback);
		request.end()

		
		/*var rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
		var handler = new htmlparser.DefaultHandler(function (error, dom) {
			if (error)
				response.send("errror");
			else
				response.send(dom);
		});
		var parser = new htmlparser.Parser(handler);
		parser.parseComplete(rawHtml);*/
	});

app.get('/kategoriDetay', function(request, response) {
 				//http://localhost:5000/kategoriDetay?kategori=haber
                var kategori = request.query.kategori
 
                var options = {
                  // protocol: 'https:', --this isn't necessary
                  hostname: 'www.kumandatv.com',
                  path: '/kategori/' + kategori,
                };
                callback = function(response2) {
                  var str = '';
                //  console.log('statusCode: ', response.statusCode);
                //  console.log('headers: ', response.headers);
 
                  response2.on('data', function(data){
                    str += data;
                  });
 
                  response2.on('end', function() {
                  	//
					const $ = cheerio.load(str,  { decodeEntities: false })

					// kanal listesi ve linki
					var kanalList =[];

					$('a.kanalli').each(function() {
					    var text = $(this).text();
					    var link = $(this).attr('href');
					    var kId = link.substring(23);
 

					    if(link && link.match(/www.kumandatv.com/)){
					      	console.log(text + ' --> ' + link);
					      	var kanalObj = {kanal:text, kanalLink:link, kanalResim: '',kanalId: kId};
					      	kanalList.push(kanalObj);
					    };
					});


					// resimleri çekiyoruz
					var kanalList1 =[];

					$('img').each(function() {
 					    var link = $(this).attr('src');
		 
					    if(link && link.match(/kanallar/)){
					      	console.log(' ++> ' + link);
					      	var kanalObj = {kanalResim:link};
					      	kanalList1.push(kanalObj);
					    };
					});


					// objeyi birleştiriyoruz	
					for (i = 0; i < kanalList.length; i++) { 
						kanalList[i].kanalResim = kanalList1[i].kanalResim;
					}			

					//console.log(kanalList);

						//console.log( kategoriList  );
					   	var kanalObjStr = JSON.stringify(kanalList);
					 	console.log( kanalObjStr  );
                  	//
                    response.send(kanalObjStr);


                  });
                }
 
                var request = https.request(options, callback);
                request.end()
});

	app.get('/yayinAkisi', function(request, response) {

		var tv = request.query.tv
	 
	    var options = {
	    // protocol: 'https:', --this isn't necessary
	    	hostname: 'www.kumandatv.com',
	        path: '/' + tv,
	    };
		callback = function(response2) { 
		  var str = '';
		//  console.log('statusCode: ', response.statusCode); 
		//  console.log('headers: ', response.headers); 

		response2.on('data', function(data){ 
			str += data;
		}); 

		response2.on('end', function() {
		    


		const $ = cheerio.load(str,  { decodeEntities: false })

	 

		var yayinAkisiList =[];

		$('#yayinakisi li').each(function(i, elm) {
	    	var yayinAkisiObj = {yayin:$(this).text(), yayinSaat:""};
			yayinAkisiList.push(yayinAkisiObj);
		});


		var yayinAkisiSaatList =[];

		$('#yayinakisi li b').each(function(i, elm) {
	    	var yayinAkisiSaatObj = {yayinSaat:$(this).text()};
			yayinAkisiSaatList.push(yayinAkisiSaatObj);
		});

			

		for (i = 0; i < yayinAkisiList.length; i++) { 
			yayinAkisiList[i].yayinSaat = yayinAkisiSaatList[i].yayinSaat;
		}
		var yayinObjStr = JSON.stringify(yayinAkisiList);
		response.send(yayinObjStr);
		});
		}

		var request = https.request(options, callback);
		request.end()


	});

	app.get('/kanalDetay', function(request, response) {

	// var youtubeArrayList = ["5g0yljXFatk","jWP3ntl64I4", "oruk-T3_xSw", "6N4tCSY3TIo", "7YzYxQPVsck", "uxgKogFymQU", "_WoNCYMDBu0", "9iTR2qZ3Mz0", "0yiaqHBbVZE", "rw3En0uZ5eY", "xpmp-YLZup8", "YPu-fLEBQfg", "g54yo2vkVCQ", "tLq-NQIUK_Y", "3e8COvWWzcU", "yngLs1iFhPM", "V4CVc1hYxFQ", "v3ZkoC_XjMU", "SgVPtRPhKBU", "9OtLkmmRirY"];
	// var rnd = Math.floor(Math.random() * 20);
	// var tvLinkObj = {tvLink: youtubeArrayList[rnd], isYoutube:  true};
	// var tvLinkObjStr = JSON.stringify(tvLinkObj);
	// response.send(tvLinkObjStr);


	var tv = request.query.tv

		if(tv.includes("tv8-canli-yayin")){

			requestMe('https://www.tv8.com.tr/canli-yayin',function(err,res,bdy) {

				console.log('error:', err); // Print the error if one occurred
		  		console.log('statusCode:', res && res.statusCode);

		  		var firtIndex = bdy.search("https://tv8-tb-live.ercdn.net");
		  		var lastIndex = bdy.search("application/x-mpegURL");

		  		console.log("&&&&&&&&&&&&&" + bdy.substr(firtIndex, 100) + "&&&&&&&&&&&&&");
		  		console.log(firtIndex);
		  		console.log(bdy.substr(firtIndex, 100));


				var tvLinkObj = {tvLink: bdy.substr(firtIndex, 90), isYoutube:  false};
	  			var tvLinkObjStr = JSON.stringify(tvLinkObj);
		  		response.send(tvLinkObjStr);

			});
		}else { 

			requestMe('https://www.kumandatv.com/' + tv, function (error2, response2, body2) {
			  console.log('error:', error2); // Print the error if one occurred
			  console.log('statusCode:', response2 && response2.statusCode); // Print the response status code if a response was received

			  const $ = cheerio.load(body2,  { decodeEntities: false })

		 	$('iframe').each(function() {
				var link = $(this).attr('src');
	 

				if(link && link.match(/www.kumandatv.com/)){

					console.log(' --> ' + link);

					var options = {
					  url: link,
					  headers: {
					      'Upgrade-Insecure-Requests': '1',
					      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
					      'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					      'Referer' : 'https://www.kumandatv.com/trt-1',
					      'Accept-Encoding' : 'gzip, deflate, sdch, br',
					      'Accept-Language' : 'en-US,en;q=0.8,tr;q=0.6'
					  },
					  gzip: true
					};

					requestMe(options, function (error3, response3, body3) {
						console.log('server encoded the data as: ' + (response3.headers['content-encoding'] || 'identity'))
						var bodyWithCorrectEncoding = iconv.decode(body3, 'utf-8');
	    				console.log(bodyWithCorrectEncoding);
			  			console.log('statusCode:', response3 && response3.statusCode); // Print the response status code if a response was received

			  			var x = JSON.stringify(bodyWithCorrectEncoding);

			  			if (x.search("youtube") == -1) {
				  			var a = x.split(" ");
				  			var link = a.slice(8, 9);
				  			var linkStr = link.toString();
				  			var son = linkStr.search("width") - 13;
				  			console.log(linkStr.substr(1,son));
				  			var tvLink = linkStr.substr(1,son);
				  			var tvLinkObj = {tvLink: tvLink, isYoutube:  false};
				  			var tvLinkObjStr = JSON.stringify(tvLinkObj);

				  			response.send(tvLinkObjStr);

				  		} else {

				  			if(x.search("jwplayer") == -1) {

					  			var xlink = "";
					  			var $ = cheerio.load(x);
					  			$('iframe').each(function() {
									var link = $(this).attr('src');
									xlink = link;
					  			});
					  			var youtubeLink = xlink.substring(2, xlink.length -2);
					  			console.log("++++" + xlink.substring(2, xlink.length -2));

					  			var linkID = youtubeLink.split("/");

					  			var id = linkID[4];

					  			var tvLinkObj = {tvLink: id.substr(0,id.indexOf('?')), isYoutube:  true};
					  			var tvLinkObjStr = JSON.stringify(tvLinkObj);
					  			response.send(tvLinkObjStr);

				  			}else {
					  			var a = x.split(" ");
					  			var link = a.slice(8, 9);
					  			var linkStr = link.toString();
					  			var son = linkStr.search("width") - 13;
					  			console.log(linkStr.substr(1,son));
					  			var tvLink = linkStr.substr(1,son);

					  			var linkID = tvLink.split("=");

					  			var id = linkID[1];

					  			var tvLinkObj = {tvLink: id, isYoutube:  true};
					  			var tvLinkObjStr = JSON.stringify(tvLinkObj);

					  			response.send(tvLinkObjStr);
				  			}
				  		}

					})

				}
			});	


			})

		}
	});
 
app.listen(app.get('port'), function() {
console.log('Node app is running on port', app.get('port'));
});