var df = require(".."),
    DataFlow = df.DataFlow,
    display = require("./display");

display.title("flow exhaustion example");

display.text("flow exhaustion means that you are no longer able to write to the flow. this can happen because of an error, or because of you are out of data");
display.text("it is important to understand that flow exhaustion is final, you will never be able to write on the flow again after you made it exhausted");

display.text("in this example we will make an async array reader class, which gets exhausted at the end of the array");

var ArrayReader = DataFlow.extend({
    prototype: {
        init: function (items) {
            DataFlow.prototype.init.call(this);
            if (!items.length) {
                this.exhaust();
                return;
            }
            var pointer = 0;
            this.on("pulled", function (flow) {
                setTimeout(function () {
                    flow.write(items[pointer], function (flow) {
                        if (++pointer == items.length)
                            flow.exhaust();
                    });
                }, 1);
            });
        }
    }
});

display.text("we can do that by writing an array item to the flow each time the pulled event is triggered");

var reader = new ArrayReader([1, 2, 3]);

reader.pull(function pump(item) {
    display.data(item);
    if (!reader.isExhausted())
        reader.pull(pump);
});

display.text("we can pull the data with a simple pull callback recursion, you should see it in your console");