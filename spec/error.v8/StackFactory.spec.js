var df = require("dflo2"),
    v8 = require("dflo2/error.v8"),
    Stack = df.Stack,
    StackStringParser = v8.StackStringParser,
    StackFactory = v8.StackFactory;

describe("error.v8", function () {

    describe("StackFactory", function () {

        describe("create", function () {

            it("calls the parser with the stackString of the given nativeError", function () {

                var MockStack = Stack.extend({
                    init: jasmine.createSpy()
                });

                var mockParser = Object.create(StackStringParser.prototype);
                mockParser.parse = jasmine.createSpy();
                mockParser.parse.and.callFake(function (MockStack, stackString) {
                    return new MockStack("parsed", stackString);
                });

                var factory = new StackFactory({
                    parser: mockParser
                });

                var mockNativeError = Object.create(Error.prototype);
                mockNativeError.stack = "stackString";

                var mockStack = factory.create(MockStack, mockNativeError);
                expect(mockParser.parse).toHaveBeenCalledWith(MockStack, "stackString");
                expect(mockStack instanceof MockStack).toBe(true);
                expect(mockStack.init).toHaveBeenCalledWith("parsed", "stackString");

            });
        });

    });
});


