var df = require("../.."),
    Flow = df.Flow,
    Pump = df.Pump,
    display = require("../display");

display.title("pump await and push example");

display.text("to send data through a flow in an async way, we need to use pumps");

var aFlow = new Flow();
var aPump = new Pump(aFlow);

display.text("you can await data on a pump and when it arrives your callback will be called");
display.text("in the current example we direct arriving data to the console");

aPump.await(function (flow) {
    display.data(flow.extract());
});

display.text("as you can see now, sustaining the flow with data:123 does not have any effect");

aFlow.sustain(123);

display.text("this is because we did not refresh the pump after sustaining the flow. to do that we need to call the refresh method on the pump");

aPump.refresh();

display.text("you should see now the data in the console");

display.text("since it is easy to forget refreshing the pump, it is much easier to call the code in a pump transaction");

display.text("now sustain the flow again using a transaction");

aPump.transaction(function (flow) {
    flow.sustain(1);
});

display.text("as you can see nothing shows up on the console. this is because await callback is called only once. so we need a more permanent logger");

display.text("we can listen to the pushed event, so every time data is pushed using the pump, we will be able to extract and display it");

aPump.on("pushed", function (flow) {
    while (!flow.isDry())
        display.data(flow.extract());
});

display.text("now we added a while loop to drain the flow when the pump is pushed");

display.text("we just have to push some data to the flow, for that we can use the push method");

aPump.push(function (flow) {
    flow.sustain(2, 3);
});

display.text("so you can use push to send data and the pushed event handler or await to wait for data");