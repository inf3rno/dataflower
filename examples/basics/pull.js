var df = require("../.."),
    Flow = df.Flow,
    Pump = df.Pump,
    display = require("../display");

display.title("pump pull example");

display.text("to send data through a flow in an async way, we need to use pumps");

var aFlow = new Flow();
var aPump = new Pump(aFlow);

display.text("you can pull data using a pump and when the data arrives your callback will be called");

display.text("in the current example we direct arriving data to the console");

aPump.pull(function (flow) {
    display.data(flow.extract());
});

display.text("now we need something to serve pulls. we could use push, but a transaction is better, because push is intended to be used with await");

aPump.transaction(function (flow) {
    flow.sustain(1);
});

display.text("you should be able to see the data in the console now");
display.text("to serve pulls automatically, we need to handle the pulled event");

var i = 0;
aPump.on("pulled", function (flow) {
    flow.sustain(++i);
});

display.text("in the current example I added an event handler, which sustains the flow with increasing numbers. this should do it");

while (Math.random() < 0.8)
    aPump.pull(function (flow) {
        display.data(flow.extract());
    });

display.text("I pulled data using the pull a few times. you should see it in the console.");