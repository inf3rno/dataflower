var examples = [
    "./reader"
];
var pointer = 0;
var interval = setInterval(function () {
    var example = examples[pointer];
    require(example);
    if (++pointer == examples.length)
        clearInterval(interval);
}, 100);