module.exports.help = function(cb){
    cb(
        'Given latitute and longitute and date, returns the local time of sunrise.'
    );
};

module.exports.api = function($, data, cb){
    $.get(
        'http://api.met.no/weatherapi/sunrise/1.0/',
        {
            lat: '71.0',
            lon:'-69.58',
            date:'2008-06-23',
        },
        function(err, res){
            console.log(res);
            cb(null);
        }
    );
};
