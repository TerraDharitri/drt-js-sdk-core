import { assert } from "chai";
import { TransactionVersion } from "../networkParams";
import { Signature } from "../signature";
import { loadTestWallets, TestWallet } from "../testutils";
import { TokenPayment } from "../tokenPayment";
import { Transaction } from "../transaction";
import { TransactionPayload } from "../transactionPayload";
import { ProtoSerializer } from "./serializer";

describe("serialize transactions", () => {
    let wallets: Record<string, TestWallet>;
    let serializer = new ProtoSerializer();

    before(async function () {
        wallets = await loadTestWallets();
    });

    it("with no data, no value", async () => {
        let transaction = new Transaction({
            nonce: 89,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 50000,
            chainID: "local-testnet"
        });

        transaction.applySignature(new Signature("9bd579f3aabb32551b83880a60745a5ab65af4ce8d1061b1ea7dbf00b1352bca2da0d60daba622cb8298ac24167c1530d9bf850b901dd039d6abe0ff1455980c"), wallets.alice.address);

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "0859120200001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340d08603520d6c6f63616c2d746573746e6574580162409bd579f3aabb32551b83880a60745a5ab65af4ce8d1061b1ea7dbf00b1352bca2da0d60daba622cb8298ac24167c1530d9bf850b901dd039d6abe0ff1455980c");
    });

    it("with data, no value", async () => {
        let transaction = new Transaction({
            nonce: 90,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet"
        });

        transaction.applySignature(new Signature("5767412b3ec0bfc75c263c2e06dff426f228dcbbc960b6070c3e1ce7f0cb8c71454af3df0d9765a3696ec2eff658fb8aa23b74cb23cf43ea3f8af63263faee0a"), wallets.alice.address);

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085a120200001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e6574580162405767412b3ec0bfc75c263c2e06dff426f228dcbbc960b6070c3e1ce7f0cb8c71454af3df0d9765a3696ec2eff658fb8aa23b74cb23cf43ea3f8af63263faee0a");
    });

    it("with data, with value", async () => {
        let transaction = new Transaction({
            nonce: 91,
            value: TokenPayment.rewaFromAmount(10),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 100000,
            data: new TransactionPayload("for the book"),
            chainID: "local-testnet"
        });

        transaction.applySignature(new Signature("fd9ad23a3889d6e1dd92ca4f2713750e4dc487e0e352dfd0450a7006a5000b0223b31324f2d2c4814a914fb43743a8803e2ea1deb96c3706838816c7951a4500"), wallets.alice.address);

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085b1209008ac7230489e800001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340a08d064a0c666f722074686520626f6f6b520d6c6f63616c2d746573746e657458016240fd9ad23a3889d6e1dd92ca4f2713750e4dc487e0e352dfd0450a7006a5000b0223b31324f2d2c4814a914fb43743a8803e2ea1deb96c3706838816c7951a4500");
    });

    it("with data, with large value", async () => {
        let transaction = new Transaction({
            nonce: 92,
            value: "123456789000000000000000000000",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 100000,
            data: new TransactionPayload("for the spaceship"),
            chainID: "local-testnet"
        });

        transaction.applySignature(new Signature("c93bd900976e5b877b95d07b8d66f74e0b0cedf62a5feb937812d30077ce0bb1d1e385f3cac59ba1fe9e41acde44a00e21733d1dc5beaba1f9f1977e6fec310c"), wallets.alice.address);

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085c120e00018ee90ff6181f3761632000001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340a08d064a11666f722074686520737061636573686970520d6c6f63616c2d746573746e657458016240c93bd900976e5b877b95d07b8d66f74e0b0cedf62a5feb937812d30077ce0bb1d1e385f3cac59ba1fe9e41acde44a00e21733d1dc5beaba1f9f1977e6fec310c");
    });

    it("with nonce = 0", async () => {
        let transaction = new Transaction({
            nonce: 0,
            value: "0",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
            version: new TransactionVersion(1)
        });

        transaction.applySignature(new Signature("765d7a4449cab04b2359631018edbf598d9c5f0c492e5bd3a75f5330b5b152a9c5d81a14f3d1f36cb34a560fc37819191248654310bdeee8fa4eb9286c493c02"), wallets.alice.address)

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "120200001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e657458016240765d7a4449cab04b2359631018edbf598d9c5f0c492e5bd3a75f5330b5b152a9c5d81a14f3d1f36cb34a560fc37819191248654310bdeee8fa4eb9286c493c02");
    });
});
