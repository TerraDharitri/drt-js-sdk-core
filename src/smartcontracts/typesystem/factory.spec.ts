import { assert } from "chai";
import { TokenIdentifierType } from "./tokenIdentifier";
import { Address } from "../../address";
import { createListOfAddresses, createListOfTokenIdentifiers } from "./factory";
import { ListType } from "./generic";
import { AddressType } from "./address";

describe("test factory", () => {
    it("should create lists of addresses", () => {
        let addresses = [
            new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            new Address("drt1kgxjlszkqcvccecuvl5r64c7cju7jqwp5kh22w4e6crf827peljqcvleft"),
            new Address("drt1v3rhqg9xyglaej9jp8q9hxhsf9fzlc9dzcas5ms798c6wc5dh0yqkt4zvs"),
        ];

        let list = createListOfAddresses(addresses);
        assert.deepEqual(list.getType(), new ListType(new AddressType()));
        assert.deepEqual(list.valueOf(), addresses);
    });

    it("should create lists of token identifiers", () => {
        let identifiers = ["RIDE-7d18e9", "MOA-455c57"];
        let list = createListOfTokenIdentifiers(identifiers);
        assert.deepEqual(list.getType(), new ListType(new TokenIdentifierType()));
        assert.deepEqual(list.valueOf(), identifiers);
    });
});
