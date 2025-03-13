import { assert } from "chai";
import { ProtoSerializer } from "./serializer";
import { Nonce } from "../nonce";
import { Transaction,  } from "../transaction";
import { TestWallets } from "../testutils";
import { Signature } from "../signature";
import { Balance } from "../balance";
import { ChainID, GasLimit, GasPrice, TransactionVersion } from "../networkParams";
import { TransactionPayload } from "../transactionPayload";

describe("serialize transactions", () => {
    let wallets = new TestWallets();
    let serializer = new ProtoSerializer();

    it("with no data, no value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet")
        });

        transaction.applySignature(new Signature("6d308fe0924019c84d0c5894507435d4eedea1d3f992df5506daed1f2a2ec27e0c8176067c7a71b1680b3fe661c3b726db58fab4c9be52e169d7d4e78fd42a02"), wallets.alice.address);

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "0859120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340d08603520d6c6f63616c2d746573746e6574580162406d308fe0924019c84d0c5894507435d4eedea1d3f992df5506daed1f2a2ec27e0c8176067c7a71b1680b3fe661c3b726db58fab4c9be52e169d7d4e78fd42a02");
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

        transaction.applySignature(new Signature("75966e81a2fd78ce488c578345f2cb24ce623eb4370ed3ff8330ef9234a322b2b3ad1cc1cfb73c87e7c614bfa687b07c514010584aaa9d0a60a0781f5bdce904"), wallets.alice.address);

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085a120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e65745801624075966e81a2fd78ce488c578345f2cb24ce623eb4370ed3ff8330ef9234a322b2b3ad1cc1cfb73c87e7c614bfa687b07c514010584aaa9d0a60a0781f5bdce904");
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

        transaction.applySignature(new Signature("f0e7f02b7383fb790168d8037b1662b9f6e46f97e1f785f03c0a26718f3aa40886b6c6cadeeb4a036a3673b5569d8e6725a44684f33811187d2217fc114e1809"), wallets.alice.address);

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085b1209008ac7230489e800001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340a08d064a0c666f722074686520626f6f6b520d6c6f63616c2d746573746e657458016240f0e7f02b7383fb790168d8037b1662b9f6e46f97e1f785f03c0a26718f3aa40886b6c6cadeeb4a036a3673b5569d8e6725a44684f33811187d2217fc114e1809");
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

        transaction.applySignature(new Signature("40bcc1b98bd65ca833fa71bf2e94fd5307837ea56b4bba49bbed9bae6bc3846dfc2c244e315167b62249ad4d2799e2d8c46fa3e7913e6fb4922447354355ed04"), wallets.alice.address)

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085c120e00018ee90ff6181f3761632000001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340a08d064a11666f722074686520737061636573686970520d6c6f63616c2d746573746e65745801624040bcc1b98bd65ca833fa71bf2e94fd5307837ea56b4bba49bbed9bae6bc3846dfc2c244e315167b62249ad4d2799e2d8c46fa3e7913e6fb4922447354355ed04");
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

        transaction.applySignature(new Signature("a46d0601db75691aafd16d14d44aaec73cdb3dcbf80aa72ebfaf8361a143714c851dbba72c3689a8a397f8f6ed6288f48efbd5c5bc6c7a74ae1482f38c4e8e03"), wallets.alice.address)

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e657458016240a46d0601db75691aafd16d14d44aaec73cdb3dcbf80aa72ebfaf8361a143714c851dbba72c3689a8a397f8f6ed6288f48efbd5c5bc6c7a74ae1482f38c4e8e03");
    });
});
