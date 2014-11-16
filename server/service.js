/* General Inquiry Replyer */
var list = [
    'sunrise',
];

module.exports = {
    call: function(name){
        if(list.indexOf(name) < 0) return null;
        var plugin = require('./plugin/' + name + '.js');
        return {
            help: plugin.help,
            api: plugin.api,
        };
    },

    list: function(){
        return list;
    },
};
