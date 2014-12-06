var df = require("../df"),
    Obj = df.Object,
    publisher = df.publisher,
    subscriber = df.subscriber,
    link = df.link,
    uniqueId = df.uniqueId;

describe("examples", function () {

    describe("Observer pattern", function () {

        var Subject = Obj.extend({
            init: function (state) {
                this.publisher = publisher();
                this.state = state;
                this.links = {};
            },
            changeState: function (state) {
                this.state = state;
                this.notifyObservers();
            },
            registerObserver: function (observer) {
                if (!this.links[observer.id])
                    this.links[observer.id] = link(this.publisher, observer.subscriber);
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

        var Observer = Obj.extend({
            init: function () {
                this.id = uniqueId();
                this.subscriber = subscriber(this.notify.bind(this));
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



