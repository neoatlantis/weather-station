module.exports.help = function(cb){
    cb(
        'Given latitute and longitute and date, returns the local time of sunrise.'
    );
};

module.exports.api = function(data, cb){
    cb(Error(''));
};
