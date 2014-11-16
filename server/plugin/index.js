var list = [
    
];

module.exports = function(name){
    if(list.indexOf(name) < 0) return null;
    return require('./' + name + '.js');
};
