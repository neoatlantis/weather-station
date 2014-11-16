/* General Inquiry Replyer */
var list = [
    'sunrise',
];

var $ = {};

module.exports = {
    call: function(name){
        if(list.indexOf(name) < 0) return null;
        var plugin = require('./plugin/' + name + '.js');
        return {
            help: plugin.help,
            api: function(data, cb){plugin.api($, data, cb);},
        };
    },

    list: function(){
        return list;
    },
};

//////////////////////////////////////////////////////////////////////////////

var http = require('http'), 
    url = require('url'),
    querystring = require('querystring');
$.get = function(u, data, cb){
    var parsedUrl = url.parse(u);

    parsedUrl.search = querystring.stringify(data);

    var called = false;
    var requestUrl = url.format(parsedUrl);
    var request = http.get(requestUrl);

    request.on('error', function(e){
        if(called) return;
        called = true;
        cb(e);
    });

    request.on('response', function(res){
        var data = '';
        res.on('data', function(d){ data += d; });
        res.on('end', function(d){
            if(called) return;
            if(d) data += d;
            called = true;
            cb(null, data);
        });
    });

    setTimeout(function(){
        if(called) return;
        called = true;
        cb(Error('timeout'));
        request.abort();
    }, 10000);
};
