var request = require('request');
var cheerio = require('cheerio');
var Xray = require('x-ray');
var csv = require('fast-csv');
var mkdirp = require('mkdirp');
var fs = require("fs");
var d = new Date();
var fullDate = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
var x = Xray();
var async = require('async');
var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
var allObjects = [];
var count = 0;

x('http://shirts4mike.com', {
  shirts: x('.shirts a@href', ['.products li a@href']) //return object of all urls to be scraped .products li a@href'
})
(function(err,obj){
  if(!err){
      var len = obj.shirts.length;
      //loop over each url
      async.forEach(Object.keys(obj.shirts), function(url, callback){
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
                    csv.writeToPath('./data/' + fullDate + '.csv', allObjects,
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
      },function(err){
      });
    }else{
      console.log('There has been an error:' + err);
    }
})
