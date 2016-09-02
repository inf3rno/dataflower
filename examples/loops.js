var df = require(".."),
    DataFlow = df.DataFlow,
    display = require("./display");

display.title("loops example");

var flow = new DataFlow();

display.text("we can create a loop by writing data when the pulled event is triggered and start another pull right after that");
display.text("our current pull loop stops pumping when data reaches 3, so you should see the increasing numbers from 1 to 3 in your console");

var i = 0;
flow.on("pulled", function (flow) {
    flow.write(++i);
    if (i < 3)
        flow.pull(display.data);
});
flow.pull(display.data);

display.text("another possible solution to create a loop to read data when the pushed event is triggered and continue pushing after that");
display.text("our current loop does the same as the loop of the pulling example, so it pushes number from 1 to 3, you should see it in the console");

var flow2 = new DataFlow();

flow2.on("pushed", function (flow2) {
    var data = flow2.read();
    display.data(data);
    if (data < 3)
        flow2.push(data + 1);
});

flow2.push(1);

display.text("we don't necessary need to use flow events to sustain a loop, it can be done with the usage of an external loop");
display.text("by pull we have a callback, so we can wrap that callback into a recursive function to sustain the loop");

var flow3 = new DataFlow();

var j = 0;
flow3.on("pulled", function (flow3) {
    flow3.write(++j);
});

(function pump() {
    flow3.pull(function (data) {
        display.data(data);
        if (data < 3)
            pump();
    });
})();

display.text("by push we can easily sustain the loop with a sync loop, for example with a while loop");

var flow4 = new DataFlow();

flow4.on("pushed", function (flow4) {
    display.data(flow4.read());
});

for (var k = 1; k < 4; ++k)
    flow4.push(k);

display.text("if that is not enough, we can sustain a flow with the loop of another flow");

var flow5 = new DataFlow();

flow5.on("pushed", function (flow5) {
    display.data(flow5.read());
});

var l = 0;
var flow6 = new DataFlow();

flow6.on("pulled", function (flow6) {
    flow6.write(++l);
});

(function pump() {
    flow6.pull(function (data) {
        flow5.push(data);
        if (data < 3)
            pump();
    });
})();

display.text("in the current example we sustained a pushing loop with a pulling loop");
display.text("this is a common pattern for example by reading a file and writing the modified chunks into another file");

var flow7 = new DataFlow();
var flow8 = new DataFlow();

var m = 0;
flow8.on("pulled", function (flow8) {
    flow8.write(++m);
});

flow7.on("pushed", function () {
    var data1 = flow7.read();
    flow8.pull(function (data2) {
        display.data(data1, data2);
    });
});

(["a", "b", "c"]).forEach(function (data1) {
    flow7.push(data1);
});

display.text("doing the inverse, so sustaining a pull loop with a push loop is not that common, it can be used to merge 2 flows or to read multiple chunks at once");