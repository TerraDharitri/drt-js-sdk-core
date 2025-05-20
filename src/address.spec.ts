import { assert } from "chai";
import { Address } from "./address";
import * as errors from "./errors";


describe("test address", () => {
    let aliceBech32 = "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l";
    let bobBech32 = "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2";
    let aliceHex = "c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24";
    let bobHex = "3ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce17";

    it("should create address", async () => {
        let alice = new Address(aliceBech32);
        let bob = new Address(bobBech32);

        assert.equal(alice.hex(), aliceHex);
        assert.equal(bob.hex(), bobHex);
    });

    it("should create empty address", async () => {
        let nobody = new Address();

        assert.isEmpty(nobody.hex());
        assert.isEmpty(nobody.bech32());
        assert.deepEqual(nobody.toJSON(), { bech32: "", pubkey: "" });
    });

    it("should check equality", () => {
        let aliceFoo = new Address(aliceBech32);
        let aliceBar = new Address(aliceHex);
        let bob = new Address(bobBech32);

        assert.isTrue(aliceFoo.equals(aliceBar));
        assert.isTrue(aliceBar.equals(aliceFoo));
        assert.isTrue(aliceFoo.equals(aliceFoo));
        assert.isFalse(bob.equals(aliceBar));
        assert.isFalse(bob.equals(null));
    });

    it("should throw error when invalid input", () => {
        assert.throw(() => new Address("foo"), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address("a".repeat(7)), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address(Buffer.from("aaaa", "hex")), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address("drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2"), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address("xdrt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu"), errors.ErrAddressCannotCreate);
    });

    it("should validate the address without throwing the error", () => {
        assert.isTrue(Address.isValid(aliceBech32));
        assert.isFalse(Address.isValid('xdrt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu'));
        assert.isFalse(Address.isValid('drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2'))
    })
});
