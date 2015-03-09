var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    df = require("dataflower"),
    Subscription = ps.Subscription,
    publisher = psf.publisher,
    subscribe = psf.subscribe,
    subscriber = psf.subscriber,
    InvalidArguments = df.InvalidArguments;

describe("pubsub.fluent", function () {

    describe("subscribe", function () {

        it("accepts publisher and subscriber arguments", function () {

            var subscription = subscribe(
                publisher().component,
                subscriber(function () {
                }).component
            );
            expect(subscription instanceof Subscription).toBe(true);
        });

        it("accepts publisher, subscriber and context arguments", function () {

            var subscription = subscribe(
                publisher().component,
                subscriber(function () {
                }).component,
                {}
            );
            expect(subscription instanceof Subscription).toBe(true);
        });

        it("accepts Subscription instance", function () {

            var subscription = new Subscription({
                items: [
                    publisher().component,
                    subscriber(function () {
                    }).component
                ],
                context: {}
            });
            expect(subscribe(subscription)).toBe(subscription);
        });

        it("accepts options", function () {

            var subscription = subscribe({
                items: [
                    publisher().component,
                    subscriber(function () {
                    }).component
                ],
                context: {}
            });
            expect(subscription instanceof Subscription).toBe(true);
        });

        it("accepts any subscriber and publisher function arguments e.g. wrappers", function () {

            var subscription = subscribe({
                items: [
                    publisher(),
                    subscriber(function () {
                    })
                ]
            });
            var subscription2 = subscribe(
                publisher(),
                subscriber(function () {
                })
            );
            var subscription3 = subscribe(
                {},
                function () {
                }
            );
            expect(subscription instanceof Subscription).toBe(true);
            expect(subscription2 instanceof Subscription).toBe(true);
            expect(subscription3 instanceof Subscription).toBe(true);
        });

        it("does not accept empty arguments", function () {

            expect(subscribe).toThrow(new InvalidArguments.Empty());
        });

        it("does not accept more than 3 arguments", function () {

            expect(function () {
                subscribe({}, function () {
                }, {}, {});
            }).toThrow(new InvalidArguments());
        });

        it("does not accept invalid type of arguments", function () {
            expect(function () {
                subscribe("string");
            }).toThrow(new InvalidArguments());
        });
    });

});
