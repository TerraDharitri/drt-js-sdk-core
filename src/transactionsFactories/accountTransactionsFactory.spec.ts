import { assert } from "chai";
import { Address } from "../address";
import { TransactionsFactoryConfig } from "./transactionsFactoryConfig";
import { AccountTransactionsFactory } from "./accountTransactionsFactory";

describe("test account transactions factory", function () {
    const config = new TransactionsFactoryConfig({ chainID: "D" });
    const factory = new AccountTransactionsFactory({ config: config });

    it("should create 'Transaction' for saving key value", async function () {
        const sender = Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        const keyValuePairs = new Map([[Buffer.from("key0"), Buffer.from("value0")]]);

        const transaction = factory.createTransactionForSavingKeyValue({
            sender: sender,
            keyValuePairs: keyValuePairs,
        });

        assert.equal(transaction.sender, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(transaction.receiver, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(Buffer.from(transaction.data).toString(), "SaveKeyValue@6b657930@76616c756530");
        assert.equal(transaction.value, 0n);
        assert.equal(transaction.chainID, config.chainID);
        assert.equal(transaction.gasLimit, 271000n);
    });

    it("should create 'Transaction' for setting guardian", async function () {
        const sender = Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        const guardian = Address.fromBech32("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2");
        const serviceID = "DharitrITCSService";

        const transaction = factory.createTransactionForSettingGuardian({
            sender: sender,
            guardianAddress: guardian,
            serviceID: serviceID,
        });

        assert.equal(transaction.sender, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(transaction.receiver, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(
            Buffer.from(transaction.data).toString(),
            "SetGuardian@3ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce17@446861726974724954435353657276696365",
        );
        assert.equal(transaction.value, 0n);
        assert.equal(transaction.chainID, config.chainID);
        assert.equal(transaction.gasLimit, 469500n);
    });

    it("should create 'Transaction' for guarding account", async function () {
        const sender = Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");

        const transaction = factory.createTransactionForGuardingAccount({
            sender: sender,
        });

        assert.equal(transaction.sender, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(transaction.receiver, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(Buffer.from(transaction.data).toString(), "GuardAccount");
        assert.equal(transaction.value, 0n);
        assert.equal(transaction.chainID, config.chainID);
        assert.equal(transaction.gasLimit, 318000n);
    });

    it("should create 'Transaction' for unguarding account", async function () {
        const sender = Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");

        const transaction = factory.createTransactionForUnguardingAccount({
            sender: sender,
        });

        assert.equal(transaction.sender, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(transaction.receiver, "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(Buffer.from(transaction.data).toString(), "UnGuardAccount");
        assert.equal(transaction.value, 0n);
        assert.equal(transaction.chainID, config.chainID);
        assert.equal(transaction.gasLimit, 321000n);
    });
});
