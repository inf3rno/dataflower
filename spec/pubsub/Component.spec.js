var ps = require("dataflower/pubsub"),
    Subscription = ps.Subscription,
    Component = ps.Component;

describe("pubsub", function () {

    describe("Component.prototype", function () {

        describe("addSubscription", function () {

            it("requires a subscription", function () {

                var component = new Component();
                expect(function () {
                    component.addSubscription();
                }).toThrow(new Component.SubscriptionRequired());

            });

            it("adds a subscription", function () {

                var mockSubscription = Object.create(Subscription.prototype);
                mockSubscription.id = 1;

                var component = new Component();
                component.addSubscription(mockSubscription);

                expect(component.subscriptions[1]).toBe(mockSubscription);

            });

        });

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

                it("calls handleWrapper with the parameters and the context", function () {

                    var component = new Component({
                        handleWrapper: jasmine.createSpy().and.returnValue(123)
                    });

                    var wrapper = component.toFunction();
                    expect(component.handleWrapper).not.toHaveBeenCalled();
                    expect(wrapper(1, 2, 3)).toBe(123);
                    var global = (function () {
                        return this;
                    })();
                    expect(component.handleWrapper).toHaveBeenCalledWith([1, 2, 3], global);
                    var o = {
                        m: wrapper
                    };
                    o.m(4, 5, 6);
                    expect(component.handleWrapper).toHaveBeenCalledWith([4, 5, 6], o);
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