import BigNumber from "bignumber.js";
import { assert } from "chai";
import { TransactionOptions, TransactionVersion } from "./networkParams";
import { loadTestWallets, TestWallet } from "./testutils";
import { TokenPayment } from "./tokenPayment";
import { Transaction } from "./transaction";
import { TransactionPayload } from "./transactionPayload";


describe("test transaction construction", async () => {
    let wallets: Record<string, TestWallet>;
    let minGasLimit = 50000;
    let minGasPrice = 1000000000;

    before(async function () {
        wallets = await loadTestWallets();
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

        await wallets.alice.signer.sign(transaction);
        assert.equal("9bd579f3aabb32551b83880a60745a5ab65af4ce8d1061b1ea7dbf00b1352bca2da0d60daba622cb8298ac24167c1530d9bf850b901dd039d6abe0ff1455980c", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "054d1e251740e2f64f1c604074fecc7f51076a9735acd83b3d9e04a732a8dc22");
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

        await wallets.alice.signer.sign(transaction);
        assert.equal("5767412b3ec0bfc75c263c2e06dff426f228dcbbc960b6070c3e1ce7f0cb8c71454af3df0d9765a3696ec2eff658fb8aa23b74cb23cf43ea3f8af63263faee0a", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "426c9fdfa978d4875f22c43423013ec8e8ff68ac14bc58e2e037f2370d9494e6");
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

        await wallets.alice.signer.sign(transaction);
        assert.equal("ddd296619c84110e1e77ab187c70c97c20b0ff848557d471763e4e69824ad96a6c8966a1959e8817818b3169a902c8cd9f2a5c8e6566de29964fead4815a8d06", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "6d1a8c61a3261f36de8857527b3687fa9e29f3000dde6384b291dba89d265fbd");
    });

    it("with data, with value", async () => {
        let transaction = new Transaction({
            nonce: 91,
            value: TokenPayment.rewaFromAmount(10),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 100000,
            data: new TransactionPayload("for the book"),
            chainID: "local-testnet"
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("fd9ad23a3889d6e1dd92ca4f2713750e4dc487e0e352dfd0450a7006a5000b0223b31324f2d2c4814a914fb43743a8803e2ea1deb96c3706838816c7951a4500", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "4f57111d68ec2c80b17110deea7234d6aa39a335fa467c6da563a3e85e185cda");
    });

    it("with data, with large value", async () => {
        let transaction = new Transaction({
            nonce: 92,
            value: TokenPayment.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasPrice: minGasPrice,
            gasLimit: 100000,
            data: new TransactionPayload("for the spaceship"),
            chainID: "local-testnet"
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("c93bd900976e5b877b95d07b8d66f74e0b0cedf62a5feb937812d30077ce0bb1d1e385f3cac59ba1fe9e41acde44a00e21733d1dc5beaba1f9f1977e6fec310c", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "ccdf1fc77831e0ef388e002f0ff15bfc2b54441ce3c505d549dc670757369b37");
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

        await wallets.alice.signer.sign(transaction);
        assert.equal("765d7a4449cab04b2359631018edbf598d9c5f0c492e5bd3a75f5330b5b152a9c5d81a14f3d1f36cb34a560fc37819191248654310bdeee8fa4eb9286c493c02", transaction.getSignature().hex());
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

        await wallets.alice.signer.sign(transaction);
        assert.equal("9bd579f3aabb32551b83880a60745a5ab65af4ce8d1061b1ea7dbf00b1352bca2da0d60daba622cb8298ac24167c1530d9bf850b901dd039d6abe0ff1455980c", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "054d1e251740e2f64f1c604074fecc7f51076a9735acd83b3d9e04a732a8dc22");

        let result = transaction.serializeForSigning(wallets.alice.address);
        assert.isFalse(result.toString().includes("options"));
    });

    it("computes correct fee", () => {
        let transaction = new Transaction({
            nonce: 92,
            value: TokenPayment.rewaFromBigInteger("123456789000000000000000000000"),
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
            ChainID: "T"
        };

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "5050");
    });

    it("computes correct fee with data field", () => {
        let transaction = new Transaction({
            nonce: 92,
            value: TokenPayment.rewaFromBigInteger("123456789000000000000000000000"),
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
            gasPrice: minGasPrice,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet"
        });

        const plainObject = transaction.toPlainObject(sender);
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
            value: TokenPayment.rewaFromBigInteger("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 50000,
            chainID: "local-testnet"
        });
        assert.equal(tx2.getValue().toString(), "123456789000000000000000000000");

        const tx3 = new Transaction({
            // Passing a BigNumber is not recommended. 
            // However, ITransactionValue interface is permissive, and developers may mistakenly pass such objects as values.
            // TokenPayment objects or simple strings (see above) are preferred, instead.
            value: new BigNumber("123456789000000000000000000000"),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 50000,
            chainID: "local-testnet"
        });
        assert.equal(tx3.getValue().toString(), "123456789000000000000000000000");
    });
});
