var df = require(".."),
    DataFlow = df.DataFlow,
    display = require("./display");

display.title("pushing example");

var flow = new DataFlow();

display.text("awaiting data on a flow and directing it to the console when it arrives");

flow.await(display.data);

display.text("writing data:123 on the flow, you should see it in the console");

flow.write(123);

display.text("writing data:456 on the flow, you should not see it in the console, because await is only for waiting for the next message");

flow.write(456);
flow.read();

display.text("to make a permanent logger, we need to listen to the pushed event");

flow.on("pushed", function (flow) {
    display.data(flow.read());
});

display.text("pushing data:123 on the flow, you should see it in the console");

flow.push(123);

display.text("pushing data:456 on the flow, you should see it in the console");

flow.push(456);

display.text("writing data:789 on the flow, you should not see it in the console, because it is a simple write which does not trigger the pushed event");

flow.write(789);

display.text("so pushing is for letting a permanent consumer to know, there is data on the flow which it can consume");

display.ending();