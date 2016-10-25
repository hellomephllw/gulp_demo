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
console.log(11);
});

//# sourceMappingURL=resources/index-e64c53b7f5.js.map
