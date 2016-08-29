var expect = require("expect.js"),
    sinon = require("sinon"),
    df = require("../..");

module.exports = function () {

    var a;

    this.When(/^a$/, function () {
        a = true;
    });

    this.Then(/^b$/, function () {
        expect(a).to.be.ok();
    });

};