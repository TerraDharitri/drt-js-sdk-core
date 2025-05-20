import { UserPublicKey, UserVerifier } from "./wallet";
import BigNumber from "bignumber.js";
import { assert } from "chai";
import { Address } from "./address";
import { MIN_TRANSACTION_VERSION_THAT_SUPPORTS_OPTIONS } from "./constants";
import { TransactionOptions, TransactionVersion } from "./networkParams";
import { ProtoSerializer } from "./proto";
import { TestWallet, loadTestWallets } from "./testutils";
import { TokenTransfer } from "./tokens";
import { Transaction } from "./transaction";
import { TransactionComputer } from "./transactionComputer";
import { TransactionPayload } from "./transactionPayload";

describe("test transaction", async () => {
    let wallets: Record<string, TestWallet>;
    const minGasLimit = 50000;
    const minGasPrice = 1000000000;

    const transactionComputer = new TransactionComputer();

    const networkConfig = {
        MinGasLimit: 50000,
        GasPerDataByte: 1500,
        GasPriceModifier: 0.01,
        ChainID: "D",
    };

    before(async function () {
        wallets = await loadTestWallets();
    });

    it("should serialize transaction for signing (without data)", async () => {
        const transaction = new Transaction({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.bob.address.bech32(),
            gasLimit: 50000n,
            value: 0n,
            version: 2,
            nonce: 89n,
        });

        const serializedTransactionBytes = transactionComputer.computeBytesForSigning(transaction);
        const serializedTransaction = Buffer.from(serializedTransactionBytes).toString();

        assert.equal(
            serializedTransaction,
            `{"nonce":89,"value":"0","receiver":"drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2","sender":"drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l","gasPrice":1000000000,"gasLimit":50000,"chainID":"D","version":2}`,
        );
    });

    it("should serialize transaction for signing (with data)", async () => {
        const transaction = new Transaction({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.bob.address.bech32(),
            gasLimit: 70000n,
            value: 1000000000000000000n,
            version: 2,
            nonce: 90n,
            data: new Uint8Array(Buffer.from("hello")),
        });

        const serializedTransactionBytes = transactionComputer.computeBytesForSigning(transaction);
        const serializedTransaction = Buffer.from(serializedTransactionBytes).toString();

        assert.equal(
            serializedTransaction,
            `{"nonce":90,"value":"1000000000000000000","receiver":"drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2","sender":"drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l","gasPrice":1000000000,"gasLimit":70000,"data":"aGVsbG8=","chainID":"D","version":2}`,
        );
    });

    it("should sign transaction (with no data, no value) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 89,
            value: "0",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet",
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "608e79523dc2d9e226ba820b41f541033b419509e5d2a7c0ebb4dabe2e7f353b854cc2861516969e8cc4396b25064eb300ea2beee2a036dea38847c8aa273509",
        );
        assert.equal(
            transaction.getHash().toString(),
            "ddb8d5c1869a0e61fbdc7b674fd3747ac5f009a3aba43691eb59846e6350c140",
        );
    });

    it("should sign transaction (with data, no value) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 90,
            value: "0",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "58bf879780ef82367595bac476a2e17c9d0c6df2ecf36e02b6ea24f068ce3e8a5e9bda8e54d8a8d996f2ff59b2b26771708b59cbc779b16fba5592efecd2120f",
        );
        assert.equal(
            transaction.getHash().toString(),
            "e5219b253408159a86fb94d29677fa7ce802dce754c5fb3ba2636601ed2c8522",
        );
    });

    it("should sign transaction (with usernames)", async () => {
        const transaction = new Transaction({
            chainID: "T",
            sender: wallets.carol.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 50000n,
            value: 1000000000000000000n,
            version: 2,
            nonce: 204n,
            senderUsername: "carol",
            receiverUsername: "alice",
        });

        transaction.signature = await wallets.carol.signer.sign(
            transactionComputer.computeBytesForSigning(transaction),
        );

        assert.equal(
            Buffer.from(transaction.signature).toString("hex"),
            "d335ef8f4f56ba2c6647e0e7835d5aec751449f0b3fd91125cce42de9440fdb7ab7be51b754b42cad97a0d8c1c1263cb5dab97c63b315f03b82f08618abc2000",
        );
    });

    it("should compute hash", async () => {
        const transaction = new Transaction({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 100000n,
            value: 1000000000000n,
            version: 2,
            nonce: 17243n,
            data: Buffer.from("testtx"),
        });

        transaction.signature = Buffer.from(
            "eaa9e4dfbd21695d9511e9754bde13e90c5cfb21748a339a79be11f744c71872e9fe8e73c6035c413f5f08eef09e5458e9ea6fc315ff4da0ab6d000b450b2a07",
            "hex",
        );

        const hash = transactionComputer.computeTransactionHash(transaction);

        assert.equal(
            Buffer.from(hash).toString("hex"),
            "0e9c4640b4e63f8d858c8947c335962fd3199cebf01cc0c391521bdaa0062428",
        );
    });

    it("should compute hash (with usernames)", async () => {
        const transaction = new Transaction({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 100000n,
            value: 1000000000000n,
            version: 2,
            nonce: 17244n,
            data: Buffer.from("testtx"),
            senderUsername: "alice",
            receiverUsername: "alice",
        });

        transaction.signature = Buffer.from(
            "807bcd7de5553ea6dfc57c0510e84d46813c5963d90fec50991c500091408fcf6216dca48dae16a579a1611ed8b2834bae8bd0027dc17eb557963f7151b82c07",
            "hex",
        );

        const hash = transactionComputer.computeTransactionHash(transaction);

        assert.equal(
            Buffer.from(hash).toString("hex"),
            "8ff6449ddaf699292178078f2d5e5cdb67ddfc69fc177d5ae326ebe587db880c",
        );
    });

    it("should sign & compute hash (with data, with opaque, unused options) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 89,
            value: "0",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet",
            // The protocol ignores the options when version == 1
            version: new TransactionVersion(1),
            options: new TransactionOptions(1),
        });

        assert.throws(() => {
            transaction.serializeForSigning();
        }, `Non-empty transaction options requires transaction version >= ${MIN_TRANSACTION_VERSION_THAT_SUPPORTS_OPTIONS}`);
    });

    it("should sign & compute hash (with data, with value) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 91,
            value: TokenTransfer.rewaFromAmount(10),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 100000,
            data: new TransactionPayload("for the book"),
            chainID: "local-testnet",
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "dab87c26d70950608765bd11e21f4ed2922800d84fb4d0be1e473b2b5567303ed907b019d91b216c37dcab61216a5e238910d5fbbddacb8aea9ba085ae0e2908",
        );
        assert.equal(
            transaction.getHash().toString(),
            "40f55ef3469aad8f6d91120350a31da56141c32c9b60c64cc5f5505d242760af",
        );
    });

    it("should sign & compute hash (with data, with large value) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 92,
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 100000,
            data: new TransactionPayload("for the spaceship"),
            chainID: "local-testnet",
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "113097fc14df2d2357847e6b6a88d02478833d436f79feb7f85700482bba5f373175f6c1429d1437eafe36f5a4a07da776caa944713ab925579b0deb69cce609",
        );
        assert.equal(
            transaction.getHash().toString(),
            "d88f1297e2fb41c23d285a34dc1cbb9bb83c4940d6f4c0235c419bb807f3f82f",
        );
    });

    it("should sign & compute hash (with nonce = 0) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 0,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(1),
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "765d7a4449cab04b2359631018edbf598d9c5f0c492e5bd3a75f5330b5b152a9c5d81a14f3d1f36cb34a560fc37819191248654310bdeee8fa4eb9286c493c02",
        );
        assert.equal(
            transaction.getHash().toString(),
            "8ce423090741cff1d696cdb26d8cf2d15b1dc0ab895592896c613333100228f9",
        );
    });

    it("should sign & compute hash (without options field, should be omitted) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 89,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet",
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "608e79523dc2d9e226ba820b41f541033b419509e5d2a7c0ebb4dabe2e7f353b854cc2861516969e8cc4396b25064eb300ea2beee2a036dea38847c8aa273509",
        );
        assert.equal(
            transaction.getHash().toString(),
            "ddb8d5c1869a0e61fbdc7b674fd3747ac5f009a3aba43691eb59846e6350c140",
        );

        const result = transaction.serializeForSigning();
        assert.isFalse(result.toString().includes("options"));
    });

    it("should sign & compute hash (with guardian field, should be omitted) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 89,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet",
        });

        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "608e79523dc2d9e226ba820b41f541033b419509e5d2a7c0ebb4dabe2e7f353b854cc2861516969e8cc4396b25064eb300ea2beee2a036dea38847c8aa273509",
        );
        assert.equal(
            transaction.getHash().toString(),
            "ddb8d5c1869a0e61fbdc7b674fd3747ac5f009a3aba43691eb59846e6350c140",
        );

        const result = transaction.serializeForSigning();
        assert.isFalse(result.toString().includes("options"));
    });

    it("should sign & compute hash (with usernames) (legacy)", async () => {
        const transaction = new Transaction({
            nonce: 204,
            value: "1000000000000000000",
            sender: Address.fromBech32("drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q"),
            receiver: Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            senderUsername: "carol",
            receiverUsername: "alice",
            gasLimit: 50000,
            chainID: "T",
        });

        transaction.applySignature(await wallets.carol.signer.sign(transaction.serializeForSigning()));

        assert.equal(
            transaction.getSignature().toString("hex"),
            "d335ef8f4f56ba2c6647e0e7835d5aec751449f0b3fd91125cce42de9440fdb7ab7be51b754b42cad97a0d8c1c1263cb5dab97c63b315f03b82f08618abc2000",
        );
        assert.equal(
            transaction.getHash().toString(),
            "c1d010d14c592b72b5de092fd6fcefbb74b7fe6595b4be01ded5555a7c1bd9e0",
        );
    });

    it("should sign & compute hash (guarded transaction)", async () => {
        const alice = wallets.alice;

        const transaction = new Transaction({
            chainID: "local-testnet",
            sender: alice.address.bech32(),
            receiver: wallets.bob.address.bech32(),
            gasLimit: 150000n,
            gasPrice: 1000000000n,
            data: new Uint8Array(Buffer.from("test data field")),
            version: 2,
            options: 2,
            nonce: 92n,
            value: 123456789000000000000000000000n,
            guardian: "drt1x23lzn8483xs2su4fak0r0dqx6w38enpmmqf2yrkylwq7mfnvyhsmueha6",
        });
        transaction.guardianSignature = new Uint8Array(64);
        transaction.signature = await alice.signer.sign(transactionComputer.computeBytesForSigning(transaction));

        const serializer = new ProtoSerializer();
        const buffer = serializer.serializeTransaction(transaction);

        assert.equal(
            buffer.toString("hex"),
            "085c120e00018ee90ff6181f3761632000001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340f093094a0f746573742064617461206669656c64520d6c6f63616c2d746573746e6574580262408be41d8274ae995d17b03fb0769ecd8ac571caef8772b57fb26c9f47f95ed140fa8d96818580d2557c435611cd52c9957427134f618501c7006aed459e3b7e0d6802722032a3f14cf53c4d0543954f6cf1bda0369d13e661dec095107627dc0f6d33612f7a4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        );

        const txHash = transactionComputer.computeTransactionHash(transaction);
        assert.equal(
            Buffer.from(txHash).toString("hex"),
            "f937d7007645958e016bb14eb647df3bff647dc57eb9472862be8b6d2eacfdfd",
        );
    });

    it("computes fee (legacy)", () => {
        const transaction = new Transaction({
            nonce: 92,
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: minGasLimit,
            chainID: "local-testnet",
        });

        const fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "50000000000000");
    });

    it("computes fee", async () => {
        const transaction = new Transaction({
            chainID: "D",
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 50000n,
            gasPrice: minGasPrice,
        });

        const gasLimit = transactionComputer.computeTransactionFee(transaction, networkConfig);
        assert.equal(gasLimit.toString(), "50000000000000");
    });

    it("computes fee, but should throw `NotEnoughGas` error", async () => {
        const transaction = new Transaction({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 50000n,
            data: Buffer.from("toolittlegaslimit"),
        });

        assert.throws(() => {
            transactionComputer.computeTransactionFee(transaction, networkConfig);
        });
    });

    it("computes fee (with data field) (legacy)", () => {
        let transaction = new Transaction({
            nonce: 92,
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            data: new TransactionPayload("testdata"),
            gasPrice: minGasPrice,
            gasLimit: minGasLimit + 12010,
            chainID: "local-testnet",
        });

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "62000100000000");
    });

    it("computes fee (with data field)", async () => {
        const transaction = new Transaction({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 50000n + 12010n,
            gasPrice: minGasPrice,
            data: Buffer.from("testdata"),
        });

        const gasLimit = transactionComputer.computeTransactionFee(transaction, networkConfig);
        assert.equal(gasLimit.toString(), "62000100000000");
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
            chainID: "local-testnet",
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
            chainID: "local-testnet",
        });
        assert.equal(tx1.getValue().toString(), "123456789000000000000000000000");

        const tx2 = new Transaction({
            value: TokenTransfer.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 50000,
            chainID: "local-testnet",
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
            chainID: "local-testnet",
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
            options: TransactionOptions.withOptions({ guarded: true }),
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
            options: TransactionOptions.withOptions({ guarded: true }),
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
            options: TransactionOptions.withOptions({ guarded: true }),
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
            options: TransactionOptions.withOptions({ guarded: true }),
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
            options: TransactionOptions.withOptions({ guarded: true }),
        });
        transaction.applySignature(await wallets.alice.signer.sign(transaction.serializeForSigning()));
        transaction.applyGuardianSignature(transaction.getSignature());
        assert.isTrue(transaction.isGuardedTransaction());
    });

    it("test sign using hash", async () => {
        let transaction = new Transaction({
            nonce: 89n,
            value: 0n,
            sender: wallets.alice.address.toBech32(),
            receiver: wallets.bob.address.toBech32(),
            gasLimit: 50000n,
            gasPrice: 1000000000n,
            chainID: "integration tests chain ID",
            version: 2,
            options: 1,
        });

        transaction.signature = await wallets.alice.signer.sign(transactionComputer.computeHashForSigning(transaction));

        assert.equal(
            "1280c117b6b2ce130b4f74018883a5225d99aa63e7cc3242f5612002c670eebccc2aea51cf4aca6802fcb02269891f6926b525c6a4c30850d980917965bafa0e",
            Buffer.from(transaction.signature).toString("hex"),
        );
    });

    it("should apply guardian", async () => {
        let transaction = new Transaction({
            nonce: 89n,
            value: 0n,
            sender: wallets.alice.address.toBech32(),
            receiver: wallets.bob.address.toBech32(),
            gasLimit: 50000n,
            chainID: "localnet",
        });

        transactionComputer.applyGuardian(transaction, wallets.carol.address.toBech32());

        assert.equal(transaction.version, 2);
        assert.equal(transaction.options, 2);
        assert.equal(transaction.guardian, wallets.carol.address.toBech32());
    });

    it("should apply guardian with options set for hash signing", async () => {
        let transaction = new Transaction({
            nonce: 89n,
            value: 0n,
            sender: wallets.alice.address.toBech32(),
            receiver: wallets.bob.address.toBech32(),
            gasLimit: 50000n,
            chainID: "localnet",
            version: 1,
        });

        transactionComputer.applyOptionsForHashSigning(transaction);
        assert.equal(transaction.version, 2);
        assert.equal(transaction.options, 1);

        transactionComputer.applyGuardian(transaction, wallets.carol.address.toBech32());
        assert.equal(transaction.version, 2);
        assert.equal(transaction.options, 3);
    });

    it("should ensure transaction is valid", async () => {
        let transaction = new Transaction({
            sender: "invalidAddress",
            receiver: wallets.bob.address.toBech32(),
            gasLimit: 50000n,
            chainID: "",
        });

        transaction.sender = wallets.alice.address.toBech32();

        assert.throws(() => {
            transactionComputer.computeBytesForSigning(transaction);
        }, "The `chainID` field is not set");

        transaction.chainID = "localnet";
        transaction.version = 1;
        transaction.options = 2;

        assert.throws(() => {
            transactionComputer.computeBytesForSigning(transaction);
        }, `Non-empty transaction options requires transaction version >= ${MIN_TRANSACTION_VERSION_THAT_SUPPORTS_OPTIONS}`);

        transactionComputer.applyOptionsForHashSigning(transaction);

        assert.equal(transaction.version, 2);
        assert.equal(transaction.options, 3);
    });

    it("should compute bytes to verify transaction signature", async () => {
        let transaction = new Transaction({
            sender: wallets.alice.address.toBech32(),
            receiver: wallets.bob.address.toBech32(),
            gasLimit: 50000n,
            chainID: "D",
            nonce: 7n,
        });

        transaction.signature = await wallets.alice.signer.sign(
            transactionComputer.computeBytesForSigning(transaction),
        );

        const userVerifier = new UserVerifier(new UserPublicKey(wallets.alice.address.getPublicKey()));
        const isSignedByAlice = userVerifier.verify(
            transactionComputer.computeBytesForVerifying(transaction),
            transaction.signature,
        );

        const wrongVerifier = new UserVerifier(new UserPublicKey(wallets.bob.address.getPublicKey()));
        const isSignedByBob = wrongVerifier.verify(
            transactionComputer.computeBytesForVerifying(transaction),
            transaction.signature,
        );

        assert.equal(isSignedByAlice, true);
        assert.equal(isSignedByBob, false);
    });

    it("should compute bytes to verify transaction signature (signed by hash)", async () => {
        let transaction = new Transaction({
            sender: wallets.alice.address.toBech32(),
            receiver: wallets.bob.address.toBech32(),
            gasLimit: 50000n,
            chainID: "D",
            nonce: 7n,
        });

        transactionComputer.applyOptionsForHashSigning(transaction);

        transaction.signature = await wallets.alice.signer.sign(transactionComputer.computeHashForSigning(transaction));

        const userVerifier = new UserVerifier(new UserPublicKey(wallets.alice.address.getPublicKey()));
        const isSignedByAlice = userVerifier.verify(
            transactionComputer.computeBytesForVerifying(transaction),
            transaction.signature,
        );

        const wrongVerifier = new UserVerifier(new UserPublicKey(wallets.bob.address.getPublicKey()));
        const isSignedByBob = wrongVerifier.verify(
            transactionComputer.computeBytesForVerifying(transaction),
            transaction.signature,
        );

        assert.equal(isSignedByAlice, true);
        assert.equal(isSignedByBob, false);
    });
});
