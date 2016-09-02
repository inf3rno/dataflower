var chalk = require("chalk");

module.exports = {
    title: function (title) {
        console.log("\n");
        var lines = Array.prototype.slice.call(arguments);
        for (var i in lines)
            console.log("> " + lines[i].toUpperCase());
    },
    text: function (text) {
        var lines = Array.prototype.slice.call(arguments);
        for (var i in lines)
            console.log("> " + chalk.cyan(lines[i]));
    },
    data: function (data) {
        var manyData = Array.prototype.slice.call(arguments);
        manyData.unshift(">");
        console.log.apply(console, manyData);
    }
};