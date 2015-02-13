var df = require("dflo2");

describe("df", function () {

    var id = df.id,
        publisher = df.publisher,
        subscriber = df.subscriber,
        subscribe = df.subscribe,
        Publisher = df.Publisher,
        Subscriber = df.Subscriber,
        Subscription = df.Subscription;

    describe("id", function () {

        it("returns unique id", function () {
            var store = {};
            for (var i = 0; i < 1000; ++i) {
                var current = id();
                if (current in store)
                    break;
                store[current] = true;
            }
            expect(i).toBe(1000);
        });

    });

    describe("publisher", function () {

        it("returns a Publisher instance wrapper using Publisher.instance", function () {

            var wrapper = publisher();
            expect(wrapper.publisher instanceof Publisher).toBe(true);

        });

    });

    describe("subscriber", function () {

        it("returns a Subscriber instance using Subscriber.instance", function () {

            var instance = subscriber(function () {
            });
            expect(instance instanceof Subscriber).toBe(true);

        });

    });

    describe("subscribe", function () {

        it("returns a Subscription instance using Subscription.instance", function () {

            var instance = subscribe(df.publisher(), function () {
            });
            expect(instance instanceof Subscription).toBe(true);

        });

    });

});
