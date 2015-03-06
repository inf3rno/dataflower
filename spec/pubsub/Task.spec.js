var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Subscriber = ps.Subscriber,
    Task = ps.Task,
    Publisher = ps.Publisher;

describe("pubsub", function () {

    describe("Task", function () {

        it("is a Subscriber descendant", function () {

            expect(Task.prototype instanceof Subscriber).toBe(true);
        });

        describe("init", function () {

            it("creates an error and a done Publisher", function () {

                var task = new Task({
                    callback: function () {
                    }
                });
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

        describe("toFunction", function () {

            it("returns a wrapper which contains the error and the done wrappers", function () {

                var task = new Task({
                    callback: function () {
                    }
                });
                var wrapper = task.toFunction();
                expect(wrapper instanceof Function).toBe(true);
                expect(wrapper).toBe(task.toFunction());
                expect(wrapper.component).toBe(task);
                expect(wrapper.done).toBe(task.done.toFunction());
                expect(wrapper.error).toBe(task.error.toFunction());
            });

            describe("the wrapper returned by toFunction", function () {

                it("calls receive on the task", function () {

                    var task = new Task({
                        callback: function () {
                        }
                    });
                    var receive = spyOn(task, "receive");
                    var wrapper = task.toFunction();
                    var o = {
                        x: wrapper
                    };
                    expect(receive).not.toHaveBeenCalled();
                    o.x(1, 2, 3);
                    expect(receive).toHaveBeenCalledWith([1, 2, 3], o);
                });

            });

        });

    });

});