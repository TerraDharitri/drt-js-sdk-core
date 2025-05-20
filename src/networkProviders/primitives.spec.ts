import { assert } from "chai";
import { Address } from "./primitives";

describe("test primitives", function () {
    it("should create address from bech32 and from pubkey", async function () {
        let aliceBech32 = "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l";
        let bobBech32 = "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2";
        let alicePubkey = Buffer.from("c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24", "hex");
        let bobPubkey = Buffer.from("3ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce17", "hex");

        assert.equal(new Address(aliceBech32).bech32(), Address.fromPubkey(alicePubkey).bech32());
        assert.equal(new Address(bobBech32).bech32(), Address.fromPubkey(bobPubkey).bech32());
        assert.equal(new Address(aliceBech32).toString(), aliceBech32);
        assert.equal(new Address(bobBech32).toString(), bobBech32);
    });
});

