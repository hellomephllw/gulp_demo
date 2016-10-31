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
console.log(2);
});

//# sourceMappingURL=resources/index-6dd8823a89.js.map
