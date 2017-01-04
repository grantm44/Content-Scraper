var request = require('request');
var cheerio = require('cheerio');
var Xray = require('x-ray');
var csv = require('fast-csv');
var mkdirp = require('mkdirp');
var fs = require("fs");

var x = Xray();


var allObjects = [];
var count = 0;

var d = new Date();
var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
function formatDate(){
    var month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

x('http://shirts4mike.com', {
  shirts: x('.shirts a@href', ['.products li a@href']) //return object of all urls to be scraped .products li a@href'
})
(function(err,obj){
  if(!err){
      var len = obj.shirts.length;
      //loop over each url
      Object.keys(obj.shirts).forEach(function(url, callback){
        var add = obj.shirts[url];
        //make request for each address
        //and get title, price, imageURL, URL, time
        x(add, {
          Title:'.shirt-picture img@alt',
          Price: '.price@html',
          ImageURL: '.shirt-picture img@src'
        })(function(err, obj){
            if(!err){
              obj['URL'] = add;
              obj['Time'] = time;
              allObjects.push(obj); //create array of all the data
              count++;
                if(count >= len){ //reached end, write to csv
                mkdirp('./data', function(err){
                  if(err){
                    console.log(err)
                  }
                  else{
                    csv.writeToPath('./data/' + formatDate() + '.csv', allObjects,
                    {
                      headers: true
                    });
                  }
                });
              }
            }else{
              console.log(err);
            }
          })
        });
    }else{
      console.log('There has been an error:' + err);
    }
})
