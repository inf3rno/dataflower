var df = require("../df"),
    link = df.link,
    publisher = df.publisher,
    subscriber = df.subscriber,
    component = df.component;

describe("df", function () {

    describe("component", function () {

        it("receives input from publishers  and sends output to subscribers", function () {
            var comp = component({
                input: function (p1, p2) {
                    setTimeout(function () {
                        this.output(p2, p1);
                    }.bind(this), 1);
                },
                output: publisher
            });
            var pub = publisher();
            var sub = subscriber(function (p2, p1) {
                log(p1, p2);
            });
            link(pub, comp.input);
            link(comp.output, sub);

            var log = jasmine.createSpy();

            runs(function () {
                pub(1, 2);
            });
            waitsFor(function () {
                return log.callCount;
            });
            runs(function () {
                expect(log).toHaveBeenCalledWith(1, 2);
            });
        });

        it("can have multiple inputs and outputs", function () {
            var comp = component({
                input1: function () {
                    this.output1a("1a");
                    this.output1b("1b");
                },
                input2: function () {
                    this.output2a("2a");
                },
                output1a: publisher,
                output1b: publisher,
                output2a: publisher
            });
            var pub = publisher();
            var log = jasmine.createSpy();
            var sub = subscriber(log);

            link(pub, comp.input1);
            link(comp.output1a, sub);

            pub();
            expect(log).toHaveBeenCalledWith("1a");
            expect(log).not.toHaveBeenCalledWith("1b");
            expect(log).not.toHaveBeenCalledWith("2a");

            link(pub, comp.input2);
            link(comp.output1b, sub);
            link(comp.output2a, sub);
            pub();

            expect(log).toHaveBeenCalledWith("1b");
            expect(log).toHaveBeenCalledWith("2a");
        });

    });

});