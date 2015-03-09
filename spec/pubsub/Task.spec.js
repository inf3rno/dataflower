var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Subscriber = ps.Subscriber,
    Task = ps.Task,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Task", function () {

        it("is a Subscriber descendant", function () {

            expect(Task.prototype instanceof Subscriber).toBe(true);
        });

        describe("configure", function () {

            it("creates an error and a done Publisher", function () {

                var task = new Task({
                    callback: function () {
                    }
                });
                expect(task.called instanceof Publisher).toBe(true);
                expect(task.done instanceof Publisher).toBe(true);
                expect(task.error instanceof Publisher).toBe(true);
            });

        });

        describe("receive", function () {

            it("requires the array of parameters", function () {

                var task = new Task({
                    callback: function () {
                    }
                });
                expect(function () {
                    task.receive();
                }).toThrow(new Task.ArrayRequired());
            });

            it("publishes the parameters on the called Publisher", function () {

                var log = jasmine.createSpy();
                var task = new Task({
                    callback: function () {
                    }
                });
                new Subscription({
                    items: [
                        task.called,
                        new Subscriber({
                            callback: log
                        })
                    ]
                });
                var o = {
                    m: task.toFunction()
                };
                o.m(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
                expect(log.calls.first().object).toBe(o);
            });


            it("calls the callback with a Function and the parameters in the given context", function () {

                var log = jasmine.createSpy();
                var task = new Task({
                    callback: log
                });
                expect(log).not.toHaveBeenCalled();
                task.receive([1, 2, 3]);
                expect(log).toHaveBeenCalledWith(jasmine.any(Function), 1, 2, 3);
                var o = {};
                task.receive([4, 5, 6], o);
                expect(log).toHaveBeenCalledWith(jasmine.any(Function), 4, 5, 6);
                expect(log.calls.mostRecent().object).toBe(o);
            });

            describe("the Function given to the callback by receive", function () {

                it("calls publish on the error or the done Publisher depending on whether the first param is falsy", function () {

                    var fn;
                    var o = {};
                    var task = new Task({
                        callback: function (_fn) {
                            fn = _fn;
                            expect(this).toBe(o);
                        }
                    });
                    var done = spyOn(task.done, "publish");
                    var error = spyOn(task.error, "publish");
                    task.receive([], o);

                    expect(done).not.toHaveBeenCalled();
                    expect(error).not.toHaveBeenCalled();

                    fn();
                    expect(done).toHaveBeenCalledWith([], o);
                    expect(error).not.toHaveBeenCalled();
                    done.calls.reset();

                    fn(1, 2, 3);
                    expect(done).not.toHaveBeenCalled();
                    expect(error).toHaveBeenCalledWith([1, 2, 3], o);
                    error.calls.reset();

                    fn(0, 1, 2, 3);
                    expect(done).toHaveBeenCalledWith([1, 2, 3], o);
                    expect(error).not.toHaveBeenCalled();
                });

            });

        });

    });

});