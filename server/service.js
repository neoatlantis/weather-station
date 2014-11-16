/* General Inquiry Replyer */

var pluginIndex = require('./plugin/index.js');

module.exports = function(name){
    var plugin = pluginIndex(name);
    if(!plugin) return null;
    return {
        help: plugin.help,
        api: plugin.api,
    };
};
