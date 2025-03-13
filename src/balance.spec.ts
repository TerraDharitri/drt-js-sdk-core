import { assert } from "chai";
import { Balance } from "./balance";

describe("test balance", () => {
    it("should have desired precision", () => {
        assert.equal(Balance.rewa(1).toString(), "1000000000000000000");
        assert.equal(Balance.rewa(10).toString(), "10000000000000000000");
        assert.equal(Balance.rewa(100).toString(), "100000000000000000000");
        assert.equal(Balance.rewa(1000).toString(), "1000000000000000000000");

        assert.equal(Balance.rewa(0.1).toString(), "100000000000000000");
        assert.equal(Balance.rewa("0.1").toString(), "100000000000000000");

        assert.equal(Balance.rewa("0.123456789").toString(), "123456789000000000");
        assert.equal(Balance.rewa("0.123456789123456789").toString(), "123456789123456789");
        assert.equal(Balance.rewa("0.123456789123456789777").toString(), "123456789123456789");
        assert.equal(Balance.rewa("0.123456789123456789777777888888").toString(), "123456789123456789");
    });

    it("should format as currency", () => {
        assert.equal(Balance.rewa(0.1).toCurrencyString(), "0.100000000000000000 REWA");
        assert.equal(Balance.rewa(1).toCurrencyString(), "1.000000000000000000 REWA");
        assert.equal(Balance.rewa(10).toCurrencyString(), "10.000000000000000000 REWA");
        assert.equal(Balance.rewa(100).toCurrencyString(), "100.000000000000000000 REWA");
        assert.equal(Balance.rewa(1000).toCurrencyString(), "1000.000000000000000000 REWA");
        assert.equal(Balance.rewa("0.123456789").toCurrencyString(), "0.123456789000000000 REWA");
        assert.equal(Balance.rewa("0.123456789123456789777777888888").toCurrencyString(), "0.123456789123456789 REWA");
    });

    it("should format as denominated", () => {
        assert.equal(new Balance('1000000000').toDenominated(), "0.000000001000000000");
    });
});
