var expect = require("expect.js"),
    sinon = require("sinon"),
    df = require("../.."),
    XYZ = df.XYZ;

module.exports = function () {

    var xyz,
        dataListener,
        notificationListener;

    this.When(/^I write data on xyz$/, function (next) {
        xyz = new XYZ();
        xyz.write(12);
        next();
    });

    this.Then(/^I should be able to read the data from xyz$/, function (next) {
        expect(xyz.read()).to.be(12);
        next();
    });

    this.When(/^I am waiting for data on xyz$/, function (next) {
        xyz = new XYZ();
        dataListener = sinon.spy();
        xyz.await(dataListener);
        next();
    });

    this.Then(/^I should get the data when xyz is written$/, function (next) {
        expect(dataListener.called).to.be(false);
        xyz.write(34);
        expect(dataListener.calledOnce).to.be(true);
        expect(dataListener.withArgs(34).calledOnce).to.be(true);
        xyz.write(56);
        expect(dataListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I pull data from xyz$/, function (next) {
        xyz = new XYZ();
        notificationListener = sinon.spy();
        xyz.on("pulled", notificationListener);
        expect(notificationListener.called).to.be(false);
        dataListener = sinon.spy();
        xyz.pull(dataListener);
        next();
    });

    this.Then(/^xyz should be notified about the pull$/, function (next) {
        expect(notificationListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I push data to xyz$/, function (next) {
        xyz = new XYZ();
        notificationListener = sinon.spy();
        xyz.on("pushed", notificationListener);
        expect(notificationListener.called).to.be(false);
        xyz.push(12);
        next();
    });

    this.Then(/^xyz should be notified about the push$/, function (next) {
        expect(notificationListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I don't write data on xyz$/, function (next) {
        xyz = new XYZ();
        next();
    });

    this.Then(/^I should not be able to read data from xyz$/, function (next) {
        expect(function () {
            xyz.read();
        }).to.throwError(function (error) {
            expect(error.toString()).to.be("NoDataAvailable: No data available on xyz.");
        });
        next();
    });

};