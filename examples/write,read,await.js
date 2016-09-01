var df = require(".."),
    DataFlow = df.DataFlow,
    display = require("./display");

display.title("write, read and await example");

var flow = new DataFlow();

display.text("if you want to read something from the flow, it needs to be already written. so reading without data should lead to an error as you can see in the console");

try {
    flow.read();
} catch (error) {
    display.data(error.toString());
}

display.text("so we should write some data to the flow before reading it");

flow.write(123);

display.text("data:123 is written to the flow, so we can read it now. you should see it in the console");

display.data(flow.read());

display.text("by reading data:123 we removed it from the flow, so the flow is now empty again. to read more data we need to write on it");

flow.write(456);
flow.write(789);

display.text("after writing data:456 and data:789 to the flow we can read them again in the same order, you should see them in the console");

display.data(flow.read(), flow.read());

display.text("if we are not sure whether the data is written or not, then we need to use the await method");

flow.await(function (data) {
    display.data(data);
});

display.text("so the callback we give to the await will be called whenever the data is available. let's write data:123 and data:456 onto the flow");

flow.write(123);
flow.write(456);

display.text("as you can see in the console, only the data:123 shows up. this is because the await waits only for a single data message and not for multiple ones");

display.text("to read the data:456 you can apply either need or await. I call an await now, so you can see that it is called immediately, because data is available");

flow.await(function (data) {
    display.data(data);
});

display.ending();