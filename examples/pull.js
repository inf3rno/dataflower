var df = require(".."),
    DataFlow = df.DataFlow,
    display = require("./display");

display.title("pulling example");

var flow = new DataFlow();

display.text("awaiting data on a flow and directing it to the console when it arrives");

flow.await(display.data);

display.text("since there is no event triggered we need to write manually data:123 to serve waited data, it should show up in the console");

flow.write(123);

display.text("if you want to actively pull the data by reading, you need to use the pull method and set a pulled event handler");

flow.on("pulled", function (flow) {
    flow.write(456);
});

display.text("so after setting the event handler, pull will trigger a pulled event and you will be able to generate data for the hungry consumer");

flow.pull(display.data);

display.text("calling pull should read the generated data every time it is called, currently it is always data:456 and is sent to the console");

flow.pull(display.data);
flow.pull(display.data);
flow.pull(display.data);

display.ending();