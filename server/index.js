var config = require('config'), conf = {};
conf.serviceName = config.get('service.name');
conf.serviceProviders = config.get('service.providers');

var url = require('url');
var querystring = require('querystring');
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
var serviceList = service.list();
for(var i=0; i<serviceList.length; i++){
    httpDefaultDataSourceList
        += '<li>'
        + '<a href="/' + serviceList[i].replace(/\-/g, '/') + '">'
        + serviceList[i]
        + '</a>'
        + '</li>'
    ;
};
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
            'Click for more details. <br />' +
            httpDefaultDataSourceList + 
        '</body>' +
    '</html>'
;
var httpError = function(title, description){
    return String(
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
            '<h2>Error: ' + title + '</h2>' +
            description +
        '</body>' +
    '</html>'
    );
};
var httpHelp = function(title, description){
    return String(
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
            '<a href="/">Back</a>' +
            '<h2>Help: ' + title + '</h2>' +
            description +
        '</body>' +
    '</html>'
    );
};

//////////////////////////////////////////////////////////////////////////////
// IO system, via HTTP and SocketIO


// HTTP handler
function handler(req, res){
    var urlParsed = url.parse(req.url),
        urlData = querystring.parse(urlParsed.query);

    var apiName = urlParsed.pathname.slice(1).replace(/\//g, '-');
    console.log('ACCESS via HTTP: ' + apiName);

    if('' == apiName){
        res.writeHead(200);
        res.end(httpDefault);
        return;
    };

    var accessService = service.call(apiName);
    if(!accessService){
        res.writeHead(404);
        res.end(httpError('Unknown API name', ''));
        console.log('> Unknown API name.');
        return;
    };

    function httpCallbackAPI(ret){
        if(toString.apply(ret) === '[object Error]'){
            res.writeHead(404);
            res.end(httpError('API execution error', ret.message));
            return;
        };
        res.writeHead(200);
        res.end(JSON.stringify(ret));
    };

    function httpCallbackHelp(description){
        res.writeHead(200);
        res.end(httpHelp(apiName, description));
    };

    if(urlParsed.query)
        accessService.api(urlData, httpCallbackAPI);
    else
        accessService.help(httpCallbackHelp);
};

// SocketIO handler
io.on('connection', function(socket) {
    var list = service.list(),
        serviceAccessor = service.call;

    function socketListenerFactory(name, help){
        // callbacks
        function socketCallbackHelp(ret){
            socket.emit('help', {
                'api': name,
                'message': ret,
            });
        };

        function socketCallbackAPI(ret){
            if(toString.apply(ret) === '[object Error]')
                return socket.emit('error', {
                    'api': name,
                    'message': ret.message,
                });
            socket.emit(name, ret);
        };

        if(help)
            return function(){
                serviceAccessor(name).help(socketCallbackHelp);
            };
        else
            return function(data){
                serviceAccessor(name).api(data, socketCallbackHelp);
            };
    };

    for(var i=0; i<list; i++){
        socket.on(list[i], socketListenerFactory(list[i], false));
        socket.on(list[i] + '/help', socketListenerFactory(list[i], true));
    };
});
