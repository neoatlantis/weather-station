var config = require('config'), conf = {};
conf.serviceName = config.get('service.name');
conf.serviceProviders = config.get('service.providers');

var url = require('url');
var app = require('http').createServer(handler);
var io = require('socket.io')(app);

app.listen(config.get('server.listen'));
console.log(conf.serviceName + ': Server begin on [' + config.get('server.listen') + '].');

var service = require('./service.js');
console.log(conf.serviceName + ': Service begin.');

//////////////////////////////////////////////////////////////////////////////
// Generate HTTP page

// service providers
var httpDefaultServiceProviders = '<ul>';
for(var i in conf.serviceProviders){
    httpDefaultServiceProviders
        += '<li>'
            + '<strong>' + conf.serviceProviders[i].name + '</strong> | '
            + '<a href="mailto:' + conf.serviceProviders[i].email + '">Email</a>'
        + '</li>'
    ;
};
httpDefaultServiceProviders += '</ul>';

// data source list
var httpDefaultDataSourceList = '<ul>';
httpDefaultDataSourceList += '</ul>';

// page
var httpDefault =
    '<!DOCTYPE html>' +
    '<html>' + 
        '<head>' +
            '<meta charset="utf-8" />' + 
            '<title>' + 
                'NeoAtlantis Weather Information Relaying Server' + 
            '</title>' +
        '</head>' +
        '<body>' +
            '<h1>' + conf.serviceName + '</h1>' +
            '<hr />' +
            '<h2>This service is now run by: </h2>' +
            httpDefaultServiceProviders +
            '<h2>Currently following data are being served: </h2>' +
            httpDefaultDataSourceList + 
        '</body>' +
    '</html>'
;
var httpError = 
    '<!DOCTYPE html>' +
    '<html>' + 
        '<head>' +
            '<meta charset="utf-8" />' + 
            '<title>' + 
                'NeoAtlantis Weather Information Relaying Server' + 
            '</title>' +
        '</head>' +
        '<body>' +
            '<h1>' + conf.serviceName + '</h1>' +
            '<hr />' +
            '<h2>Error: Unknown API</h2>' +
        '</body>' +
    '</html>'
;

//////////////////////////////////////////////////////////////////////////////
// IO system, via HTTP and SocketIO


// HTTP handler
function handler(req, res){
    var urlParsed = url.parse(req.url);

    var apiName = urlParsed.pathname.slice(1).replace(/\//g, '-');

    if('' == apiName){
        res.writeHead(200);
        res.end(httpDefault);
        return;
    };

    var accessService = service(apiName);
    if(!accessService){
        res.writeHead(404);
        res.end(httpError);
        return;
    };

    if(urlParsed.query){
        
    } else {
        
    };
};

// SocketIO handler
io.on('connection', function(socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
