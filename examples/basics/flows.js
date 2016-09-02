var df = require("../.."),
    Flow = df.Flow,
    display = require("../display");

display.title("basics: using flows");

var flow = new Flow();

display.text("if you want to extract data from a flow, then the flow needs to be sustained. so extracting data from a dry flow should lead to an error as you can see in the console");

try {
    flow.extract();
} catch (error) {
    display.data(error.toString());
}

display.text("so we should give some data to the flow before extracting it");

flow.sustain(123);

display.text("data:123 is on to the flow now, so we can extract it. you should see it in the console");

display.data(flow.extract());

display.text("by extracting data:123 we removed it from the flow, so the flow is now dry again. to extract more data we need to continuously sustain it");

flow.sustain(456);
flow.sustain(789);

display.text("after giving data:456 and data:789 to the flow we can extract them again in the same order, you should see them in the console");

display.data(flow.extract(), flow.extract());

display.text("you can check whether the flow is sustained with data or it is dry");

display.data("isDry:", flow.isDry());

display.text("as you can see it is currently dry, so fill it again");

flow.sustain(1, 2, 3);
flow.sustain(4, 5, 6);

display.data("isDry:", flow.isDry());

display.text("now it is well sustained");

display.text("you can drain the flow with a single call if you want to");

display.data(flow.drain());

display.text("now it should be dry again");

display.data("isDry:", flow.isDry());

display.text("you can block the flow if you want, but currently you are not able to remove the block later");

flow.block();

display.text("when a flow is blocked you are not able to sustain it, you can only drain it, and you won't be able to use again after that");

try {
    flow.sustain(1);
} catch (error) {
    display.data(error.toString());
}

display.text("you can check whether a flow is blocked or sustainable");

display.data("isBlocked: ", flow.isBlocked(), "isSustainable", flow.isSustainable());
