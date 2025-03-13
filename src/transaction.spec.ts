import { assert } from "chai";
import { Transaction } from "./transaction";
import * as errors from "./errors";
import { Nonce } from "./nonce";
import { ChainID, GasLimit, GasPrice, GasPriceModifier, TransactionOptions, TransactionVersion } from "./networkParams";
import { TransactionPayload } from "./transactionPayload";
import { Balance } from "./balance";
import { TestWallets } from "./testutils";
import { NetworkConfig } from "./networkConfig";
import { Address } from "./address";

describe("test transaction", () => {
    it("should throw error when bad types", () => {
        assert.throw(() => new Transaction({ nonce: <any>42, receiver: new Address() }), errors.ErrBadType);
        assert.throw(() => new Transaction({ receiver: new Address(), gasLimit: <any>42 }), errors.ErrBadType);
        assert.throw(() => new Transaction({ receiver: new Address(), gasPrice: <any>42 }), errors.ErrBadType);

        assert.throw(() => new Transaction({ nonce: <any>7, receiver: new Address() }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasLimit: <any>8, receiver: new Address() }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasPrice: <any>9, receiver: new Address() }), errors.ErrBadType);

        assert.doesNotThrow(() => new Transaction({ receiver: new Address() }));
        assert.doesNotThrow(() => new Transaction({
            nonce: new Nonce(42),
            gasLimit: new GasLimit(42),
            gasPrice: new GasPrice(42),
            receiver: new Address()
        }));
        assert.doesNotThrow(() => new Transaction({ nonce: undefined, gasLimit: undefined, gasPrice: undefined, receiver: new Address() }));
    });
});

describe("test transaction construction", async () => {
    let wallets = new TestWallets();

    it("with no data, no value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("6d308fe0924019c84d0c5894507435d4eedea1d3f992df5506daed1f2a2ec27e0c8176067c7a71b1680b3fe661c3b726db58fab4c9be52e169d7d4e78fd42a02", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "f04499c49e52297fcc29e35d9f211c64b37a0dcec00d0c7d95f59c9fdf5eef1b");
    });

    it("with data, no value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(90),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(80000),
            data: new TransactionPayload("hello"),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("75966e81a2fd78ce488c578345f2cb24ce623eb4370ed3ff8330ef9234a322b2b3ad1cc1cfb73c87e7c614bfa687b07c514010584aaa9d0a60a0781f5bdce904", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "0096860c0e465a662659208ff69970e06dce73ac3b8d4373b64d13f60253e235");
    });

    it("with data, with opaque, unused options (the protocol ignores the options when version == 1)", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1),
            options: new TransactionOptions(1)
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("3cd86d0000dc310e10ba7bd36b69e9a2987999850af038b4784189a144a16b39e97f1c49d4fa9acdf22f438c105f1be748235fe64e1cfcf86c7c38c1a97c1c0d", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "39e0e18d1f269147f98fa4215a481212c8c9644f0fb43f31acf34f1b92c157aa");
    });

    it("with data, with value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(91),
            value: Balance.rewa(10),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(100000),
            data: new TransactionPayload("for the book"),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("f0e7f02b7383fb790168d8037b1662b9f6e46f97e1f785f03c0a26718f3aa40886b6c6cadeeb4a036a3673b5569d8e6725a44684f33811187d2217fc114e1809", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "c72cb860036d62f0d520c5330149342ce176458ca52878a2f1e522f2896c12c2");
    });

    it("with data, with large value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(92),
            value: Balance.fromString("123456789000000000000000000000"),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(100000),
            data: new TransactionPayload("for the spaceship"),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("40bcc1b98bd65ca833fa71bf2e94fd5307837ea56b4bba49bbed9bae6bc3846dfc2c244e315167b62249ad4d2799e2d8c46fa3e7913e6fb4922447354355ed04", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "475e2861208cd7683b1621a0cfe69a1af16b083c6787f1627ed4dc3960273f2e");
    });

    it("with nonce = 0", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(0),
            value: Balance.fromString("0"),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(80000),
            data: new TransactionPayload("hello"),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1)
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("a46d0601db75691aafd16d14d44aaec73cdb3dcbf80aa72ebfaf8361a143714c851dbba72c3689a8a397f8f6ed6288f48efbd5c5bc6c7a74ae1482f38c4e8e03", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "c77182e6c5c5a2344152d415c913e6e3a5b85e477252e5a4fd10180f2a18ffbe");
    });

    it("without options field, should be omitted", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("6d308fe0924019c84d0c5894507435d4eedea1d3f992df5506daed1f2a2ec27e0c8176067c7a71b1680b3fe661c3b726db58fab4c9be52e169d7d4e78fd42a02", transaction.getSignature().hex());
        assert.equal(transaction.getHash().toString(), "f04499c49e52297fcc29e35d9f211c64b37a0dcec00d0c7d95f59c9fdf5eef1b");

        let result = transaction.serializeForSigning(wallets.alice.address);
        assert.isFalse(result.toString().includes("options"));
    });

    it("computes correct fee", () => {
        let transaction = new Transaction({
            nonce: new Nonce(92),
            value: Balance.fromString("123456789000000000000000000000"),
            receiver: wallets.bob.address,
            gasPrice: new GasPrice(500),
            gasLimit: new GasLimit(20),
            chainID: new ChainID("local-testnet")
        });

        let networkConfig = new NetworkConfig();
        networkConfig.MinGasLimit = new GasLimit(10);
        networkConfig.GasPriceModifier = new GasPriceModifier(0.01);

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "5050");
    });

    it("computes correct fee with data field", () => {
        let transaction = new Transaction({
            nonce: new Nonce(92),
            value: Balance.fromString("123456789000000000000000000000"),
            receiver: wallets.bob.address,
            data: new TransactionPayload("testdata"),
            gasPrice: new GasPrice(500),
            gasLimit: new GasLimit(12010),
            chainID: new ChainID("local-testnet")
        });

        let networkConfig = new NetworkConfig();
        networkConfig.MinGasLimit = new GasLimit(10);
        networkConfig.GasPriceModifier = new GasPriceModifier(0.01);

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "6005000");
    });
});
