var df = require("dataflower"),
    watch = df.watch,
    InvalidArguments = df.InvalidArguments,
    dummy = df.dummy;

describe("core", function () {

    describe("watch", function () {

        it("accepts only Object instances as subject", function () {

            var property = "x";
            var listener = dummy;

            [
                null,
                undefined,
                123,
                false,
                "string"
            ].forEach(function (invalidSubject) {
                    expect(function () {
                        watch(invalidSubject, property, listener);
                    }).toThrow(new InvalidArguments());
                });
        });

        it("accepts only strings as property", function () {

            var subject = {};
            var listener = dummy;

            [
                null,
                undefined,
                123,
                false,
                {},
                dummy
            ].forEach(function (invalidProperty) {
                    expect(function () {
                        watch(subject, invalidProperty, listener);
                    }).toThrow(new InvalidArguments());
                });
        });

        it("accepts only Function as listener", function () {

            var subject = {};
            var property = "x";

            [
                null,
                undefined,
                123,
                false,
                {},
                "string"
            ].forEach(function (invalidListener) {
                    expect(function () {
                        watch(subject, property, invalidListener);
                    }).toThrow(new InvalidArguments());
                });
        });

        it("does not throw if every argument is valid", function () {

            var subject = {};
            var property = "x";
            var listener = dummy;

            expect(function () {
                watch(subject, property, listener);
            }).not.toThrow();
        });

        it("listens to the changes of the property", function () {

            var subject = {
                x: 1
            };
            var property = "x";
            var listener = jasmine.createSpy();

            watch(subject, property, listener);

            expect(subject.x).toBe(1);
            expect(listener).not.toHaveBeenCalled();

            ++subject.x;
            expect(subject.x).toBe(2);
            expect(listener.calls.count()).toBe(1);
            expect(listener).toHaveBeenCalledWith(2, 1, "x", subject);

            ++subject.x;
            expect(subject.x).toBe(3);
            expect(listener.calls.count()).toBe(2);
            expect(listener).toHaveBeenCalledWith(3, 2, "x", subject);
        });

        it("cannot listen to changes of native properties", function () {

            var subject = [];
            var property = "length";
            var listener = dummy;

            expect(function () {
                watch(subject, property, listener);
            }).toThrow(new InvalidArguments());
        });

        it("does not send message if the new value is the same as the old one", function () {

            var subject = {};
            var property = "x";
            var listener = jasmine.createSpy();

            watch(subject, property, listener);

            expect(listener).not.toHaveBeenCalled();
            subject.x = undefined;
            expect(listener).not.toHaveBeenCalled();

            subject.x = 1;
            expect(listener.calls.count()).toBe(1);
            subject.x = 1;
            expect(listener.calls.count()).toBe(1);

            subject.x = {};
            expect(listener.calls.count()).toBe(2);
            subject.x = subject.x;
            expect(listener.calls.count()).toBe(2);
            subject.x = {};
            expect(listener.calls.count()).toBe(3);
        });

        it("can have multiple listeners on the same property", function () {

            var subject = {
                x: 1
            };
            var property = "x";
            var a = jasmine.createSpy();
            var b = jasmine.createSpy();

            watch(subject, property, a);
            watch(subject, property, b);

            expect(a).not.toHaveBeenCalled();
            expect(b).not.toHaveBeenCalled();

            ++subject.x;

            expect(a.calls.count()).toBe(1);
            expect(a).toHaveBeenCalledWith(2, 1, "x", subject);
            expect(b.calls.count()).toBe(1);
            expect(b).toHaveBeenCalledWith(2, 1, "x", subject);
        });

    });

});
