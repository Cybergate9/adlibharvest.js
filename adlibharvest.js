/* test run May 2015, 200000 full records
async limit of 5, records per call 50
about an hour
*/
/* adlibharvest.js, Shaun Osborne
https://github.com/ITWrangler/adlibharvest.js
*/
var request = require('request');
var r = require('rethinkdb');
var async = require('async');
var program = require('commander');
var moment = require('moment');

program.version('0.9.5')
.option('-f --from [date]', 'becomes part of query, modification>YYYY-MM-DD')
.option('-s --startfrom [number]', 'passed to api as startfrom=[0]', 0)
.option('-r --requests [number]', 'Number of requests [10]',10)
.option('-l --limit [number]', 'limit value passed to api as limit=[50]',50)
.option('-t --transform [yes|no]', 'Transform field names to remove dot notation [yes]','yes')
.option('-q --quiet', 'do not output progress messages')
.parse(process.argv);


/* these need to be changed to your api end point and database values */
var api = "http://data.fitzmuseum.cam.ac.uk/adlibapi/wwwopac.ashx?output=json"
var params  ="&database=objects.uf&xmltype=grouped"
//var search  = "search=priref>0 AND modification>'2014-09-01'"
var search  = "search=priref>0"
if(program.from){
	var search = search+" AND modification>'"+program.from+"'";
}

var limit =parseInt(program.limit)
var startfrom  = parseInt(program.startfrom);
var requests = program.requests;
var params2 = "";
var x = 0;


if(!program.quiet){
	console.log(search, limit, requests, startfrom);
}

var urllist = new Array();
for(var i=0 ; i <= requests; i++)
{
	from = startfrom+(i*limit);
	params2 = "limit="+limit+"&startfrom="+from;
	url = api+params+'&'+params2+'&'+search;
    urllist[i]=url;
}


async.eachLimit(urllist, 5, getURL, function(err, result){
	if(err){
		console.log("ERROR: ", err);
		throw err
	}
	else{
		// nothing to worry about, we 'fell out' without a real error (ie ran out of data)
		console.log('Result:', result);
	}
});

function getURL(callurl, callback){
    var options = {
    	url: "",
    	timeout: 90000,
    };
    options.url = callurl;
	request(options,function(err, resp, body){	
		if(err ) {
		  callback(err);  
		}
		else
		{
			if(!body || body[0] === '<'){
				callback("no body: " + body + "\n" + options.url); // util.inspect(resp));
			}
			bodyxform=fixAdlibFieldNames(body,program.transform); // if asked to transform field name in adlib data
			//console.log(bodyxform);
			var adlibResponse = JSON.parse(bodyxform);

			if(adlibResponse.adlibJSON.diagnostic.hits_on_display === "0"){
				var zh = "Hits:0 at ["+options.url+"]";
				console.log(zh);
				callback(null,zh);
				//++" hits: "+adlibResponse.adlibJSON.diagnostic.hits_on_display);
			}
			else {
	      		for(var index in adlibResponse.adlibJSON.recordList.record){
	      			adlibResponse.adlibJSON.recordList.record[index]['id'] =
	      			adlibResponse.adlibJSON.recordList.record[index]['priref'][0];
	      			//console.log(adlibResponse.adlibJSON.recordList.record[index]['priref']);
	      		}
	      	writeRecord(adlibResponse.adlibJSON.recordList.record,options.url,callback);
	      }
		}
	 });	
};

function writeRecord (ADLIBjson, url, callback){

	r.connect({host: '127.0.0.1', port: 28015},
		function(err, conn){
			if(err) callback(err);
			r.db('objects').table('adlib').insert(ADLIBjson,{conflict: "replace"}).run(conn,
				function(err,result){
					if(err) {
						callback('RDB: '+err);					
					}
					conn.close();
					if(!program.quiet){console.log(moment().format(), ADLIBjson.length, JSON.stringify(result), url);}
					if (typeof callback === "function") {
						callback(null, result);
					}
				})
		})
};

function fixAdlibFieldNames (body, transform) {
	var bodyxform = body; // initial bodyxform is just plain
	if(transform === 'yes'){
	   var regex = /(\")[a-z1-9]+\.([a-z1-9_\.]+\"\:)/g;
	   bodyxform = bodyxform.replace(regex,"$1$2"); // remove 'dot notation' from *first* part of all field names
	   var regex = /(\"[a-z1-9_]+)\.([a-z1-9_\.]+\"\:)/g; 
	   bodyxform = bodyxform.replace(regex,"$1_$2"); // replace any remaining fields with 'dot notation' with '_''s
	   var regex = /(\"[a-z1-9_]+)\.([a-z1-9_\.]+\"\:)/g; 
	   bodyxform = bodyxform.replace(regex,"$1_$2"); // replace any remaining fields with 'dot notation' with '_''s
	   var regex = /(\"\@attributes\"\:)/g; 
	   bodyxform = bodyxform.replace(regex,'"attributes":'); // replace @attributes field
	    
	}
	return bodyxform;
};
