var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Component = ps.Component;

describe("pubsub", function () {

    describe("Publisher.prototype", function () {

        describe("publish", function () {

            it("calls activate and returns the result", function () {

                var publisher = new Publisher({
                    activate: jasmine.createSpy().and.returnValue(123)
                });
                expect(publisher.publish([1, 2, 3], {x: 1})).toBe(123);
                expect(publisher.activate).toHaveBeenCalledWith([1, 2, 3], {x: 1});
            });

        });

        describe("activate", function () {

            it("requires the array of parameters", function () {

                var publisher = new Publisher();
                expect(function () {
                    publisher.activate();
                }).toThrow(new Publisher.ArrayRequired());

            });

            it("sends messages to the added flows (except Publisher instances)", function () {

                var publisher = new Publisher(),
                    publisher2 = new Publisher({
                        activate: jasmine.createSpy()
                    }),
                    component = new Component({
                        activate: jasmine.createSpy()
                    });
                publisher.addAll(publisher2, component);

                expect(component.activate).not.toHaveBeenCalled();

                publisher.activate([1, 2, 3]);
                expect(component.activate).toHaveBeenCalledWith([1, 2, 3], undefined);

                var o = {};
                publisher.activate([4, 5, 6], o);
                expect(component.activate).toHaveBeenCalledWith([4, 5, 6], o);
                expect(publisher2.activate).not.toHaveBeenCalled();
            });

        });

    });
});