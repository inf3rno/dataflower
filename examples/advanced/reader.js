var df = require("../.."),
    Pump = df.Pump,
    display = require("../display");

display.title("async array reader");

display.text("this example reads an array asynchronously");

var AsyncArrayReader = Pump.extend({
    prototype: {
        init: function (items) {
            Pump.prototype.init.call(this);
            if (!items.length) {
                this.flow.block();
                return;
            }
            var pointer = 0;
            this.on("pulled", function (flow, pump) {
                setTimeout(function () {
                    pump.transaction(function () {
                        flow.sustain(items[pointer]);
                        ++pointer;
                        if (pointer == items.length)
                            flow.block();
                    });
                }, 1);
            });
        }
    }
});

var reader = new AsyncArrayReader([1, 2, 3, 4, 5, 6]);

reader.pull(function again(flow) {
    var item = flow.extract();
    display.data("async", item);
    if (!flow.isBlocked())
        reader.pull(again);
});