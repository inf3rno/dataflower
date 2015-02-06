var df = require("../df");

describe("df", function () {

    var uniqueId = df.uniqueId;
    var publisher = df.publisher;
    var subscriber = df.subscriber;
    var subscribe = df.subscribe;
    var Publisher = df.Publisher;
    var Subscriber = df.Subscriber;
    var Subscription = df.Subscription;

    describe("uniqueId", function () {

        it("returns unique id", function () {
            var store = {};
            for (var i = 0; i < 1000; ++i) {
                var id = uniqueId();
                if (id in store)
                    break;
                store[id] = true;
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

            var instance = subscribe(null, function () {
            });
            expect(instance instanceof Subscription).toBe(true);

        });

    });

});
