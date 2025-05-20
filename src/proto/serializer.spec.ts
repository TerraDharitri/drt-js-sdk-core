import { assert } from "chai";
import { Address } from "../address";
import { TransactionVersion } from "../networkParams";
import { Signature } from "../signature";
import { loadTestWallets, TestWallet } from "../testutils";
import { TokenTransfer } from "../tokens";
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
            chainID: "local-testnet",
        });

        const signer = wallets.alice.signer;
        transaction.applySignature(await signer.sign(transaction.serializeForSigning()));

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(
            buffer.toString("hex"),
            "0859120200001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340d08603520d6c6f63616c2d746573746e657458026240608e79523dc2d9e226ba820b41f541033b419509e5d2a7c0ebb4dabe2e7f353b854cc2861516969e8cc4396b25064eb300ea2beee2a036dea38847c8aa273509",
        );
    });

    it("with data, no value", async () => {
        let transaction = new Transaction({
            nonce: 90,
            value: 0,
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 80000,
            data: new TransactionPayload("hello"),
            chainID: "local-testnet",
        });

        const signer = wallets.alice.signer;
        transaction.applySignature(await signer.sign(transaction.serializeForSigning()));

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(
            buffer.toString("hex"),
            "085a120200001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e65745802624058bf879780ef82367595bac476a2e17c9d0c6df2ecf36e02b6ea24f068ce3e8a5e9bda8e54d8a8d996f2ff59b2b26771708b59cbc779b16fba5592efecd2120f",
        );
    });

    it("with data, with value", async () => {
        let transaction = new Transaction({
            nonce: 91,
            value: TokenTransfer.rewaFromAmount(10),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 100000,
            data: new TransactionPayload("for the book"),
            chainID: "local-testnet",
        });

        const signer = wallets.alice.signer;
        transaction.applySignature(await signer.sign(transaction.serializeForSigning()));

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(
            buffer.toString("hex"),
            "085b1209008ac7230489e800001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340a08d064a0c666f722074686520626f6f6b520d6c6f63616c2d746573746e657458026240dab87c26d70950608765bd11e21f4ed2922800d84fb4d0be1e473b2b5567303ed907b019d91b216c37dcab61216a5e238910d5fbbddacb8aea9ba085ae0e2908",
        );
    });

    it("with data, with large value", async () => {
        let transaction = new Transaction({
            nonce: 92,
            value: "123456789000000000000000000000",
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            gasLimit: 100000,
            data: new TransactionPayload("for the spaceship"),
            chainID: "local-testnet",
        });

        const signer = wallets.alice.signer;
        transaction.applySignature(await signer.sign(transaction.serializeForSigning()));

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(
            buffer.toString("hex"),
            "085c120e00018ee90ff6181f3761632000001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340a08d064a11666f722074686520737061636573686970520d6c6f63616c2d746573746e657458026240113097fc14df2d2357847e6b6a88d02478833d436f79feb7f85700482bba5f373175f6c1429d1437eafe36f5a4a07da776caa944713ab925579b0deb69cce609",
        );
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
            version: new TransactionVersion(1),
        });

        transaction.applySignature(
            new Signature(
                "765d7a4449cab04b2359631018edbf598d9c5f0c492e5bd3a75f5330b5b152a9c5d81a14f3d1f36cb34a560fc37819191248654310bdeee8fa4eb9286c493c02",
            ),
        );

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(
            buffer.toString("hex"),
            "120200001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e657458016240765d7a4449cab04b2359631018edbf598d9c5f0c492e5bd3a75f5330b5b152a9c5d81a14f3d1f36cb34a560fc37819191248654310bdeee8fa4eb9286c493c02",
        );
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
            chainID: "T",
        });

        const signer = wallets.carol.signer;
        transaction.applySignature(await signer.sign(transaction.serializeForSigning()));

        const buffer = serializer.serializeTransaction(transaction);
        assert.equal(
            buffer.toString("hex"),
            "08cc011209000de0b6b3a76400001a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd242205616c6963652a20b05fe535c27f46911f74f8b7f2051c54f792fca08c7ab23c53e77ececd2cd92832056361726f6c388094ebdc0340d0860352015458026240d335ef8f4f56ba2c6647e0e7835d5aec751449f0b3fd91125cce42de9440fdb7ab7be51b754b42cad97a0d8c1c1263cb5dab97c63b315f03b82f08618abc2000",
        );
    });
});
