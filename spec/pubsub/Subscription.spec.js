var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Component = ps.Component,
    Subscription = ps.Subscription,
    Base = df.Base,
    dummy = df.dummy;

describe("pubsub", function () {

    describe("Subscription.prototype", function () {

        describe("init", function () {

            it("accepts an Array of Components", function () {

                expect(function () {
                    new Subscription();
                    new Subscription({
                        items: []
                    });
                    new Subscription({
                        items: [new Component()]
                    });
                    new Subscription({
                        items: [
                            new Publisher(),
                            new Subscriber({
                                callback: dummy
                            }),
                            new Component()
                        ]
                    });
                }).not.toThrow();

                [
                    new Component(),
                    {},
                    "string",
                    123,
                    false,
                    dummy
                ].forEach(function (items) {
                        expect(function () {
                            new Subscription({
                                items: items
                            });
                        }).toThrow(new Subscription.ItemsRequired());
                    });
            });

            it("calls addAll if items given", function () {

                var log = jasmine.createSpy();
                var Descendant = Subscription.extend({
                    addAll: log
                });
                expect(log).not.toHaveBeenCalled();
                new Descendant();
                expect(log).toHaveBeenCalledWith();
                new Descendant({
                    items: [1, 2, 3]
                });
                expect(log).toHaveBeenCalledWith(1, 2, 3);
            });

        });

        describe("add", function () {

            it("accepts Components", function () {

                expect(function () {
                    var subscription = new Subscription();
                    subscription.add(new Component());
                    subscription.add(new Publisher());
                    subscription.add(new Subscriber({
                        callback: function () {
                        }
                    }));
                }).not.toThrow();

                [
                    null,
                    undefined,
                    {},
                    [],
                    "string",
                    123,
                    false,
                    dummy,
                    new Base()
                ].forEach(function (item) {
                        expect(function () {
                            var subscription = new Subscription();
                            subscription.add(item);
                        }).toThrow(new Subscription.ComponentRequired());
                    });
            });

            it("adds the subscription to the Component.subscriptions", function () {

                var item = new Component();
                var subscription = new Subscription();

                subscription.add(item);
                expect(subscription.contains(item)).toBe(true);
                expect(item.subscriptions.contains(subscription)).toBe(true);
            });

        });

        describe("remove", function () {

            it("accepts Components", function () {

                expect(function () {
                    var subscription = new Subscription();
                    subscription.remove(new Component());
                    subscription.remove(new Publisher());
                    subscription.remove(new Subscriber({
                        callback: dummy
                    }));
                }).not.toThrow();

                [
                    null,
                    undefined,
                    {},
                    [],
                    "string",
                    123,
                    false,
                    dummy,
                    new Base()
                ].forEach(function (item) {
                        expect(function () {
                            var subscription = new Subscription();
                            subscription.remove(item);
                        }).toThrow(new Subscription.ComponentRequired());
                    });
            });

            it("removes the subscription from the components", function () {

                var item = new Component();
                var subscription = new Subscription();

                subscription.add(item);
                expect(subscription.contains(item)).toBe(true);
                expect(item.subscriptions.contains(subscription)).toBe(true);

                subscription.remove(item);
                expect(subscription.contains(item)).toBe(false);
                expect(item.subscriptions.contains(subscription)).toBe(false);
            });

        });

        describe("notify", function () {

            it("calls activate and returns the result", function () {

                var subscription = new Subscription({
                    activate: jasmine.createSpy().and.returnValue(123)
                });
                expect(subscription.notify([1, 2, 3], {x: 1})).toBe(123);
                expect(subscription.activate).toHaveBeenCalledWith([1, 2, 3], {x: 1});
            });

        });


        describe("activate", function () {

            it("requires the array of arguments", function () {

                var subscription = new Subscription();
                expect(function () {
                    subscription.activate();
                }).toThrow(new Subscription.ArrayRequired());

            });

            it("activates the Subscribers in the context of the actual Publisher", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: dummy
                    });
                subscriber.activate = jasmine.createSpy();

                var subscription = new Subscription({
                    items: [publisher, subscriber]
                });

                expect(subscriber.activate).not.toHaveBeenCalled();
                subscription.activate([1, 2, 3]);
                expect(subscriber.activate).toHaveBeenCalledWith([1, 2, 3], undefined);
                subscription.activate([4, 5, 6], {});
                expect(subscriber.activate).toHaveBeenCalledWith([4, 5, 6], {});
            });

            it("notifies the Subscribers in the context if given", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: dummy
                    });
                subscriber.activate = jasmine.createSpy();

                var o = {};
                var subscription = new Subscription({
                    items: [publisher, subscriber],
                    context: o
                });

                expect(subscriber.activate).not.toHaveBeenCalled();
                subscription.activate([1, 2, 3]);
                expect(subscriber.activate).toHaveBeenCalledWith([1, 2, 3], o);
                subscription.activate([4, 5, 6], {});
                expect(subscriber.activate).toHaveBeenCalledWith([4, 5, 6], o);
            });

        });

    });
});