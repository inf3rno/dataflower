var chalk = require("chalk");

module.exports = {
    title: function (title) {
        console.log("\n");
        var lines = Array.prototype.slice.call(arguments);
        for (var index in lines)
            console.log("> " + lines[index].toUpperCase());
    },
    text: function (text) {
        var lines = Array.prototype.slice.call(arguments);
        for (var index in lines)
            console.log("> " + chalk.cyan(lines[index]));
    },
    data: function (data) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(">");
        console.log.apply(console, args);
    }
};