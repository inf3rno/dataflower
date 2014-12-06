var df = require("../df");

describe("examples", function () {

    describe("Observer pattern", function () {

        var Subject = df.Object.extend({
            init: function (state) {
                this.publisher = df.publisher();
                this.state = state;
                this.links = {};
            },
            changeState: function (state) {
                this.state = state;
                this.notifyObservers();
            },
            registerObserver: function (observer) {
                if (!this.links[observer.id])
                    this.links[observer.id] = df.link(this.publisher, observer.subscriber);
            },
            unregisterObserver: function (observer) {
                if (this.links[observer.id]) {
                    this.links[observer.id].disconnect();
                    delete(this.links[observer.id]);
                }
            },
            notifyObservers: function () {
                this.publisher(this.state);
            }
        });

        var Observer = df.Object.extend({
            init: function () {
                this.id = df.uniqueId();
                this.subscriber = df.subscriber(this.notify, this);
            },
            notify: function (state) {
                this.state = state;
            }
        });

        describe("Subject", function () {

            it("should notify the observers about its internal state changes", function () {
                var subject = new Subject();
                var observer1 = new Observer();
                var observer2 = new Observer();
                subject.registerObserver(observer1);
                subject.registerObserver(observer2);
                var newState = {};
                subject.changeState(newState);
                expect(observer1.state).toBe(newState);
                expect(observer2.state).toBe(newState);
            });

        });

    });

});



