import { assert } from "chai";
import { Address, Transaction, TransactionComputer } from "../core";
import { KeyPair } from "./keypair";
import { UserSecretKey } from "./userKeys";

describe("test keypair", () => {
    it("should create keypair", () => {
        const buffer_hex = "7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017";
        const buffer = Uint8Array.from(Buffer.from(buffer_hex, "hex"));
        const userSecretKey = UserSecretKey.fromString(buffer_hex);
        let keypair = KeyPair.newFromBytes(buffer);
        let secretKey = keypair.getSecretKey();
        assert.equal(secretKey.hex(), buffer_hex);
        assert.equal(keypair.secretKey.hex(), buffer_hex);
        assert.deepEqual(secretKey, userSecretKey);

        keypair = new KeyPair(secretKey);
        assert.deepEqual(keypair.getSecretKey(), userSecretKey);
        assert.deepEqual(keypair.getPublicKey(), userSecretKey.generatePublicKey());

        keypair = KeyPair.generate();
        const pubkey = keypair.getPublicKey();
        secretKey = keypair.getSecretKey();
        assert.lengthOf(pubkey.valueOf(), 32);
        assert.lengthOf(secretKey.valueOf(), 32);
    });

    it("should sign and verify transaction", async () => {
        const transaction = new Transaction({
            nonce: 89n,
            value: 0n,
            receiver: Address.newFromBech32("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"),
            sender: Address.newFromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            gasPrice: 1000000000n,
            gasLimit: 50000n,
            chainID: "local-testnet",
            version: 1,
            options: 0,
        });
        const bufferHex = "7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017";
        const buffer = Uint8Array.from(Buffer.from(bufferHex, "hex"));
        const keypair = KeyPair.newFromBytes(buffer);

        const transactionComputer = new TransactionComputer();
        const serializedTx = transactionComputer.computeBytesForSigning(transaction);
        transaction.signature = await keypair.sign(serializedTx);
        assert.equal(
            Buffer.from(transaction.signature).toString("hex"),
            "9bd579f3aabb32551b83880a60745a5ab65af4ce8d1061b1ea7dbf00b1352bca2da0d60daba622cb8298ac24167c1530d9bf850b901dd039d6abe0ff1455980c",
        );
        assert.isTrue(await keypair.verify(serializedTx, transaction.signature));
    });
});
