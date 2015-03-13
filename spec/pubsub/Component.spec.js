var ps = require("dataflower/pubsub"),
    Subscription = ps.Subscription,
    Component = ps.Component;

describe("pubsub", function () {

    describe("Component.prototype", function () {

        describe("toFunction", function () {

            it("returns a wrapper function", function () {

                var component = new Component();
                expect(component.toFunction() instanceof Function).toBe(true);
            });

            it("returns always the same wrapper function", function () {

                var component = new Component();
                expect(component.toFunction()).toBe(component.toFunction());
            });

            describe("wrapper", function () {

                it("calls activate with the parameters and the context", function () {

                    var component = new Component({
                        activate: jasmine.createSpy().and.returnValue(123)
                    });

                    var wrapper = component.toFunction();
                    expect(component.activate).not.toHaveBeenCalled();
                    expect(wrapper(1, 2, 3)).toBe(123);
                    var global = (function () {
                        return this;
                    })();
                    expect(component.activate).toHaveBeenCalledWith([1, 2, 3], global);
                    var o = {
                        m: wrapper
                    };
                    o.m(4, 5, 6);
                    expect(component.activate).toHaveBeenCalledWith([4, 5, 6], o);
                });

                it("has a component property", function () {

                    var component = new Component(),
                        wrapper = component.toFunction();
                    expect(wrapper.component).toBe(component);
                });

                it("adds every sub-component to the wrapper properties as wrapper functions", function () {

                    var component = new Component({
                            x: new Component(),
                            y: new Component()
                        }),
                        wrapper = component.toFunction();
                    expect(wrapper.x).toBe(component.x.toFunction());
                    expect(wrapper.y).toBe(component.y.toFunction());
                });

            });

        });

    });
});