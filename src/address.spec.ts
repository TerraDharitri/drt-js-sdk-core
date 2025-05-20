import { assert } from "chai";
import { Address, AddressComputer } from "./address";
import * as errors from "./errors";

describe("test address", () => {
    let aliceBech32 = "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l";
    let bobBech32 = "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2";
    let aliceHex = "c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24";
    let bobHex = "3ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce17";

    it("should create address", async () => {
        assert.equal(new Address(aliceBech32).toHex(), aliceHex);
        assert.equal(new Address(bobBech32).toHex(), bobHex);

        assert.equal(new Address(Buffer.from(aliceHex, "hex")).toHex(), aliceHex);
        assert.equal(new Address(Buffer.from(bobHex, "hex")).toHex(), bobHex);

        assert.equal(new Address(new Uint8Array(Buffer.from(aliceHex, "hex"))).toHex(), aliceHex);
        assert.equal(new Address(new Uint8Array(Buffer.from(bobHex, "hex"))).toHex(), bobHex);
    });

    it("should create empty address", async () => {
        const nobody = Address.empty();

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
        assert.throw(
            () => new Address("drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2"),
            errors.ErrAddressCannotCreate,
        );
        assert.throw(
            () => new Address("xdrt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu"),
            errors.ErrAddressCannotCreate,
        );
    });

    it("should validate the address without throwing the error", () => {
        assert.isTrue(Address.isValid(aliceBech32));
        assert.isFalse(Address.isValid("xdrt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu"));
        assert.isFalse(Address.isValid("drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2"));
    });

    it("should check whether isSmartContract", () => {
        assert.isFalse(
            Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l").isSmartContract(),
        );
        assert.isTrue(
            Address.fromBech32("drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqplllsphc9lf").isSmartContract(),
        );
        assert.isTrue(
            Address.fromBech32("drt1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q8vqld4").isSmartContract(),
        );
    });

    it("should contract address", () => {
        const addressComputer = new AddressComputer();
        const deployer = Address.fromBech32("drt1j0hxzs7dcyxw08c4k2nv9tfcaxmqy8rj59meq505w92064x0h40q96qj7l");

        let contractAddress = addressComputer.computeContractAddress(deployer, 0n);
        assert.equal(contractAddress.toHex(), "00000000000000000500bb652200ed1f994200ab6699462cab4b1af7b11ebd5e");
        assert.equal(contractAddress.toBech32(), "drt1qqqqqqqqqqqqqpgqhdjjyq8dr7v5yq9tv6v5vt9tfvd00vg7h40q8zfxpd");

        contractAddress = addressComputer.computeContractAddress(deployer, 1n);
        assert.equal(contractAddress.toHex(), "000000000000000005006e4f90488e27342f9a46e1809452c85ee7186566bd5e");
        assert.equal(contractAddress.toBech32(), "drt1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qy0s6t6");
    });

    it("should get address shard", () => {
        const addressComputer = new AddressComputer();

        let address = Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        let shard = addressComputer.getShardOfAddress(address);
        assert.equal(shard, 0);

        address = Address.fromBech32("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2");
        shard = addressComputer.getShardOfAddress(address);
        assert.equal(shard, 1);

        address = Address.fromBech32("drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q");
        shard = addressComputer.getShardOfAddress(address);
        assert.equal(shard, 0);
    });
});
