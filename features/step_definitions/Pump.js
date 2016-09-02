var expect = require("expect.js"),
    sinon = require("sinon"),
    df = require("../.."),
    Flow = df.Flow,
    Pump = df.Pump;

module.exports = function () {

    var aFlow,
        aPump,
        aListener,
        otherListener;

    this.When(/^I am waiting for data using a pump$/, function (next) {
        aPump = new Pump();
        aListener = sinon.spy();
        aPump.await(function (flow) {
            aListener(flow.extract());
        });
        next();
    });

    this.Then(/^I should be notified when the related flow is sustained$/, function (next) {
        expect(aListener.called).to.be(false);
        aPump.transaction(function (flow) {
            flow.sustain(34);
        });
        expect(aListener.calledOnce).to.be(true);
        expect(aListener.withArgs(34).calledOnce).to.be(true);
        aPump.transaction(function (flow) {
            flow.sustain(56);
        });
        expect(aListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I pull data using a pump$/, function (next) {
        aPump = new Pump();
        aListener = sinon.spy();
        otherListener = sinon.spy();
        aPump.on("pulled", otherListener);
        expect(otherListener.called).to.be(false);
        aPump.pull(function (flow) {
            aListener(flow.extract());
        });
        next();
    });

    this.Then(/^the pump should notice the pull$/, function (next) {
        expect(otherListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I push data using a pump$/, function (next) {
        aPump = new Pump();
        aListener = sinon.spy();
        otherListener = sinon.spy();
        aPump.on("pushed", otherListener);
        expect(otherListener.called).to.be(false);
        aPump.push(function (flow) {
            flow.sustain(12);
            aListener(flow.isDry());
        });
        next();
    });

    this.Then(/^the pump should notice the push$/, function (next) {
        expect(otherListener.calledOnce).to.be(true);
        next();
    });

    this.Then(/^I should be able to sustain the flow with it$/, function (next) {
        expect(aListener.calledOnce).to.be(true);
        expect(aListener.withArgs(false).calledOnce).to.be(true);
        next();
    });

    this.When(/^I have a dry and blocked flow$/, function (next) {
        aPump = new Pump();
        aPump.transaction(function (flow) {
            flow.block();
        });
        next();
    });

    this.Then(/^I should not be able to wait for it using a pump$/, function (next) {
        expect(function () {
            aPump.await(function () {
            });
        }).to.throwError(function (error) {
            expect(error).to.be.a(Pump.BlockedDryAwait);
        });
        next();
    });

    this.When(/^I have a non-dry but blocked flow$/, function (next) {
        aPump = new Pump();
        aPump.transaction(function (flow) {
            flow.sustain(1);
            flow.sustain(2);
            flow.block();
        });
        next();
    });

    this.Then(/^I should be able to await and extract the rest of the data from it$/, function (next) {
        aPump.await(function (flow) {
            expect(flow.isBlocked()).to.be(true);
            expect(flow.isDry()).to.be(false);
            expect(function () {
                flow.extract();
                flow.extract();
            }).to.not.throwError();
            expect(flow.isDry()).to.be(true);
        });
        expect(function () {
            aPump.await(function (flow) {
            });
        }).to.throwError(function (error) {
            expect(error).to.be.a(Pump.BlockedDryAwait);
        });
        next();
    });

    this.When(/^I await data from a flow using a pump$/, function (next) {
        aPump = new Pump();
        aPump.await(function (flow) {
        });
        next();
    });

    this.Then(/^I should get an error when the flow goes dry and blocked meanwhile$/, function (next) {
        expect(function () {
            aPump.transaction(function (flow) {
                flow.block();
            });
        }).to.throwError(function (error) {
            expect(error).to.be.a(Pump.BlockedDryAwait);
        });
        expect(aPump.flow.isBlocked()).to.be(true);
        next();
    });

};