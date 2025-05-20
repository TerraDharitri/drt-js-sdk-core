import BigNumber from "bignumber.js";
import { assert } from "chai";
import { Address } from "./address";
import { TransactionOptions, TransactionVersion } from "./networkParams";
import { TestWallet, loadTestWallets } from "./testutils";
import { TokenTransfer } from "./tokenTransfer";
import { Transaction, TransactionNext } from "./transaction";
import { TransactionPayload } from "./transactionPayload";
import { TRANSACTION_MIN_GAS_PRICE } from "./constants";


describe("test transaction construction", async () => {
    let wallets: Record<string, TestWallet>;
    let minGasLimit = 50000;
    let minGasPrice = 1000000000;

    before(async function () {
        wallets = await loadTestWallets();
    });

    it("create transaction from transaction next", async () => {
        const plainTransactionNextObject = {
            sender: "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
            receiver: "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2",
            gasLimit: 56000n,
            value: 1000000000000000000n,
            data: Buffer.from("test"),
            chainID: "T"
        };
        const nextTransaction = new TransactionNext(plainTransactionNextObject);

        const transaction = Transaction.fromTransactionNext(nextTransaction);
        assert.deepEqual(transaction.getSender(), Address.fromBech32(plainTransactionNextObject.sender));
        assert.deepEqual(transaction.getReceiver(), Address.fromBech32(plainTransactionNextObject.receiver));
        assert.equal(transaction.getGasLimit().valueOf().toFixed(0), plainTransactionNextObject.gasLimit.toString());
        assert.equal(transaction.getValue().toString(), plainTransactionNextObject.value.toString());
        assert.equal(transaction.getData().toString(), plainTransactionNextObject.data.toString());
        assert.equal(transaction.getChainID().valueOf(), plainTransactionNextObject.chainID);
        assert.equal(transaction.getNonce().valueOf(), 0);
        assert.equal(transaction.getGasPrice().valueOf(), TRANSACTION_MIN_GAS_PRICE);
        assert.deepEqual(transaction.getSignature(), Buffer.from([]));
    });

    it("with no data, no value", async () => {
        let transaction = new Transaction({
            nonce: 89,
            value: "0",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet"
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "608e79523dc2d9e226ba820b41f541033b419509e5d2a7c0ebb4dabe2e7f353b854cc2861516969e8cc4396b25064eb300ea2beee2a036dea38847c8aa273509");
        assert.equal(transaction.getHash().toString(), "ddb8d5c1869a0e61fbdc7b674fd3747ac5f009a3aba43691eb59846e6350c140");
    });

    it("with data, no value", async () => {
        let transaction = new Transaction({
            nonce: 90,
            value: "0",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet"
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "58bf879780ef82367595bac476a2e17c9d0c6df2ecf36e02b6ea24f068ce3e8a5e9bda8e54d8a8d996f2ff59b2b26771708b59cbc779b16fba5592efecd2120f");
        assert.equal(transaction.getHash().toString(), "e5219b253408159a86fb94d29677fa7ce802dce754c5fb3ba2636601ed2c8522");
    });

    it("with data, with opaque, unused options (the protocol ignores the options when version == 1)", async () => {
        let transaction = new Transaction({
            nonce: 89,
            value: "0",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet",
            version: new TransactionVersion(1),
            options: new TransactionOptions(1)
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal("ddd296619c84110e1e77ab187c70c97c20b0ff848557d471763e4e69824ad96a6c8966a1959e8817818b3169a902c8cd9f2a5c8e6566de29964fead4815a8d06", transaction.getSignature().toString("hex"));
        assert.equal(transaction.getHash().toString(), "6d1a8c61a3261f36de8857527b3687fa9e29f3000dde6384b291dba89d265fbd");
    });

    it("with data, with value", async () => {
        let transaction = new Transaction({
            nonce: 91,
            value: TokenTransfer.rewaFromAmount(10),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 100000,
            data: new TransactionPayload("for the book"),
            chainID: "local-testnet"
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "dab87c26d70950608765bd11e21f4ed2922800d84fb4d0be1e473b2b5567303ed907b019d91b216c37dcab61216a5e238910d5fbbddacb8aea9ba085ae0e2908");
        assert.equal(transaction.getHash().toString(), "40f55ef3469aad8f6d91120350a31da56141c32c9b60c64cc5f5505d242760af");
    });

    it("with data, with large value", async () => {
        let transaction = new Transaction({
            nonce: 92,
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 100000,
            data: new TransactionPayload("for the spaceship"),
            chainID: "local-testnet"
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "113097fc14df2d2357847e6b6a88d02478833d436f79feb7f85700482bba5f373175f6c1429d1437eafe36f5a4a07da776caa944713ab925579b0deb69cce609");
        assert.equal(transaction.getHash().toString(), "d88f1297e2fb41c23d285a34dc1cbb9bb83c4940d6f4c0235c419bb807f3f82f");
    });

    it("with nonce = 0", async () => {
        let transaction = new Transaction({
            nonce: 0,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(1)
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "765d7a4449cab04b2359631018edbf598d9c5f0c492e5bd3a75f5330b5b152a9c5d81a14f3d1f36cb34a560fc37819191248654310bdeee8fa4eb9286c493c02");
        assert.equal(transaction.getHash().toString(), "8ce423090741cff1d696cdb26d8cf2d15b1dc0ab895592896c613333100228f9");
    });

    it("without options field, should be omitted", async () => {
        let transaction = new Transaction({
            nonce: 89,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet"
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "608e79523dc2d9e226ba820b41f541033b419509e5d2a7c0ebb4dabe2e7f353b854cc2861516969e8cc4396b25064eb300ea2beee2a036dea38847c8aa273509");
        assert.equal(transaction.getHash().toString(), "ddb8d5c1869a0e61fbdc7b674fd3747ac5f009a3aba43691eb59846e6350c140");

        let result = transaction.serializeForSigning();
        assert.isFalse(result.toString().includes("options"));
    });

    it("with guardian field, should be omitted", async () => {
        let transaction = new Transaction({
            nonce: 89,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet"
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "608e79523dc2d9e226ba820b41f541033b419509e5d2a7c0ebb4dabe2e7f353b854cc2861516969e8cc4396b25064eb300ea2beee2a036dea38847c8aa273509");
        assert.equal(transaction.getHash().toString(), "ddb8d5c1869a0e61fbdc7b674fd3747ac5f009a3aba43691eb59846e6350c140");

        let result = transaction.serializeForSigning();
        assert.isFalse(result.toString().includes("options"));
    });

    it("with usernames", async () => {
        const transaction = new Transaction({
            nonce: 204,
            value: "1000000000000000000",
            sender: Address.fromBech32("drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q"),
            receiver: Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            senderUsername: "carol",
            receiverUsername: "alice",
            gasLimit: 50000,
            chainID: "T"
        });

        transaction.applySignature(await wallets.carol.signer.sign(transaction.serializeForSigning()));
        assert.equal(transaction.getSignature().toString("hex"), "d335ef8f4f56ba2c6647e0e7835d5aec751449f0b3fd91125cce42de9440fdb7ab7be51b754b42cad97a0d8c1c1263cb5dab97c63b315f03b82f08618abc2000");
        assert.equal(transaction.getHash().toString(), "c1d010d14c592b72b5de092fd6fcefbb74b7fe6595b4be01ded5555a7c1bd9e0");
    });

    it("computes correct fee", () => {
        let transaction = new Transaction({
            nonce: 92,
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: 500,
            gasLimit: 20,
            chainID: "local-testnet"
        });

        let networkConfig = {
            MinGasLimit: 10,
            GasPerDataByte: 1500,
            GasPriceModifier: 0.01,
            ChainID: "local-testnet"
        };

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "5050");
    });

    it("computes correct fee with data field", () => {
        let transaction = new Transaction({
            nonce: 92,
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            data: new TransactionPayload("testdata"),
            gasPrice: 500,
            gasLimit: 12010,
            chainID: "local-testnet"
        });

        let networkConfig = {
            MinGasLimit: 10,
            GasPerDataByte: 1500,
            GasPriceModifier: 0.01,
            ChainID: "T"
        };

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "6005000");
    });

    it("should convert transaction to plain object and back", () => {
        const sender = wallets.alice.address;
        const transaction = new Transaction({
            nonce: 90,
            value: "123456789000000000000000000000",
            sender: sender,
            receiver: wallets.bob.address,
            senderUsername: "alice",
            receiverUsername: "bob",
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet"
        });

        const plainObject = transaction.toPlainObject();
        const restoredTransaction = Transaction.fromPlainObject(plainObject);
        assert.deepEqual(restoredTransaction, transaction);
    });

    it("should handle large values", () => {
        const tx1 = new Transaction({
            value: "123456789000000000000000000000",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 50000,
            chainID: "local-testnet"
        });
        assert.equal(tx1.getValue().toString(), "123456789000000000000000000000");

        const tx2 = new Transaction({
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 50000,
            chainID: "local-testnet"
        });
        assert.equal(tx2.getValue().toString(), "123456789000000000000000000000");

        const tx3 = new Transaction({
            // Passing a BigNumber is not recommended. 
            // However, ITransactionValue interface is permissive, and developers may mistakenly pass such objects as values.
            // TokenTransfer objects or simple strings (see above) are preferred, instead.
            value: new BigNumber("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 50000,
            chainID: "local-testnet"
        });
        assert.equal(tx3.getValue().toString(), "123456789000000000000000000000");
    });

    it("checks correctly the version and options of the transaction", async () => {
        let transaction = new Transaction({
            nonce: 90,
            value: new BigNumber("1000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(1),
            options: TransactionOptions.withDefaultOptions(),
        });
        assert.isFalse(transaction.isGuardedTransaction());

        transaction = new Transaction({
            nonce: 90,
            value: new BigNumber("1000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(1),
            options: TransactionOptions.withOptions({ guarded: true })
        });
        assert.isFalse(transaction.isGuardedTransaction());

        transaction = new Transaction({
            nonce: 90,
            value: new BigNumber("1000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(2),
            options: TransactionOptions.withOptions({ guarded: true })
        });
        assert.isFalse(transaction.isGuardedTransaction());

        transaction = new Transaction({
            nonce: 90,
            value: new BigNumber("1000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(2),
            options: TransactionOptions.withOptions({ guarded: true })
        });
        assert.isFalse(transaction.isGuardedTransaction());

        transaction = new Transaction({
            nonce: 90,
            value: new BigNumber("1000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            guardian: wallets.bob.address,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(2),
            options: TransactionOptions.withOptions({ guarded: true })
        });
        assert.isFalse(transaction.isGuardedTransaction());

        transaction = new Transaction({
            nonce: 90,
            value: new BigNumber("1000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            guardian: wallets.bob.address,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(2),
            options: TransactionOptions.withOptions({ guarded: true })
        });
        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        transaction.applyGuardianSignature(transaction.getSignature());
        assert.isTrue(transaction.isGuardedTransaction());
    });
});
