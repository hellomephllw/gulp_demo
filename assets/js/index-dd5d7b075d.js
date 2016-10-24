define("entry" ,["jquery","utilities"], function(require , exports , module){
var $ = require('jquery'),
    util = require('utilities');

//hello man
var variable = 0;
var json = {
    name: 'zhangsan',
    age: 18
};

console.log('hello man');
});
define("utilities" ,[], function(require , exports , module){
var utilities = {
    add: function() {

    }
};

module.exports = utilities;
});
define("entry" ,["jquery","utilities"], function(require , exports , module){
var $ = require('jquery'),
    utility = require('utilities');

console.log($);
utility.add();
});

//# sourceMappingURL=resources/index-dd5d7b075d.js.map
