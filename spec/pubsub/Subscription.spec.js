var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Component = ps.Component,
    Subscription = ps.Subscription,
    Base = df.Base;

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
                                callback: function () {
                                }
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
                    function () {
                    }
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
                expect(log).not.toHaveBeenCalled();
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
                    subscription.add(
                        new Publisher(),
                        new Subscriber({
                            callback: function () {
                            }
                        }),
                        new Component()
                    );
                }).not.toThrow();

                [
                    null,
                    undefined,
                    {},
                    [],
                    "string",
                    123,
                    false,
                    function () {
                    },
                    new Base()
                ].forEach(function (item) {
                        expect(function () {
                            var subscription = new Subscription();
                            subscription.add(item);
                        }).toThrow(new Subscription.ComponentRequired());
                    });
            });

            it("adds the subscription to the Component.subscriptions", function () {

                var items = [
                    new Component(),
                    new Component(),
                    new Component()
                ];
                var subscription = new Subscription();
                subscription.add.apply(subscription, items);

                items.forEach(function (item) {
                    expect(subscription.contains(item)).toBe(true);
                    expect(item.subscriptions.contains(subscription)).toBe(true);
                });
            });

        });

        describe("remove", function () {

            it("accepts Components", function () {

                expect(function () {
                    var subscription = new Subscription();
                    subscription.remove(new Component());
                    subscription.remove(
                        new Publisher(),
                        new Subscriber({
                            callback: function () {
                            }
                        }),
                        new Component()
                    );
                }).not.toThrow();

                [
                    null,
                    undefined,
                    {},
                    [],
                    "string",
                    123,
                    false,
                    function () {
                    },
                    new Base()
                ].forEach(function (item) {
                        expect(function () {
                            var subscription = new Subscription();
                            subscription.remove(item);
                        }).toThrow(new Subscription.ComponentRequired());
                    });
            });

            it("removes the subscription from the components", function () {

                var items = [
                    new Component(),
                    new Component(),
                    new Component()
                ];
                var subscription = new Subscription();
                subscription.add.apply(subscription, items);
                subscription.remove(items[1]);

                [
                    items[0],
                    items[2]
                ].forEach(function (item) {
                        expect(subscription.contains(item)).toBe(true);
                        expect(item.subscriptions.contains(subscription)).toBe(true);
                    });
                expect(subscription.contains(items[1])).toBe(false);
                expect(items[1].subscriptions.contains(subscription)).toBe(false);
            });

        });

        describe("notify", function () {

            it("requires the array of arguments", function () {

                var subscription = new Subscription();
                expect(function () {
                    subscription.notify();
                }).toThrow(new Subscription.ArrayRequired());

            });

            it("notifies the Subscribers in the context of the actual Publisher", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: function () {
                        }
                    });
                subscriber.receive = jasmine.createSpy();

                var subscription = new Subscription({
                    items: [publisher, subscriber]
                });

                expect(subscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(subscriber.receive).toHaveBeenCalledWith([1, 2, 3], undefined);
                subscription.notify([4, 5, 6], {});
                expect(subscriber.receive).toHaveBeenCalledWith([4, 5, 6], {});
            });

            it("notifies the Subscribers in the context if given", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: function () {
                        }
                    });
                subscriber.receive = jasmine.createSpy();

                var o = {};
                var subscription = new Subscription({
                    items: [publisher, subscriber],
                    context: o
                });

                expect(subscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(subscriber.receive).toHaveBeenCalledWith([1, 2, 3], o);
                subscription.notify([4, 5, 6], {});
                expect(subscriber.receive).toHaveBeenCalledWith([4, 5, 6], o);
            });

        });

    });
});