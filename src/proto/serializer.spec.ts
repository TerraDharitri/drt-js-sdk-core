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
            "0859120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340d08603520d6c6f63616c2d746573746e657458026240958869289b34a7c1ca0cab0c214c3a0c7ba7bb352162f8d369ba948d82ce02f0cf7258ce8b28833dc3cb00c39a9533034b6e7b4e02a46c8435219350eb467700",
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
            "085a120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e657458026240878ae4f7309e7a303182a28fd649a24973f107566634b14b3ad4d3928489b917df327e85add77495e85aeaf3620f92f98388cebe3603dd18480bdf25d467250b",
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
            "085b1209008ac7230489e800001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340a08d064a0c666f722074686520626f6f6b520d6c6f63616c2d746573746e65745802624029fa63f62119324eb38bbe254af1b61f405ddfdb62a53cb9d1a45fec061028c943e3ee385f340cec5277e6164600e52c7023bfe454f4c361a13c711018931306",
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
            "085c120e00018ee90ff6181f3761632000001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340a08d064a11666f722074686520737061636573686970520d6c6f63616c2d746573746e657458026240ce2fd0f2dab851612366151f6896bd83673a4409bb76714311c15c813289831b49fb954bd747a691f20bc6b29f4f66f06d7f94b2296f823a86531055fa5c010e",
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
                "dfa3e9f2fdec60dcb353bac3b3435b4a2ff251e7e98eaf8620f46c731fc70c8ba5615fd4e208b05e75fe0f7dc44b7a99567e29f94fcd91efac7e67b182cd2a04",
            ),
        );

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(
            buffer.toString("hex"),
            "120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e657458016240dfa3e9f2fdec60dcb353bac3b3435b4a2ff251e7e98eaf8620f46c731fc70c8ba5615fd4e208b05e75fe0f7dc44b7a99567e29f94fcd91efac7e67b182cd2a04",
        );
    });

    it("with usernames", async () => {
        const transaction = new Transaction({
            nonce: 204,
            value: "1000000000000000000",
            sender: Address.fromBech32("drt1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq889n6e"),
            receiver: Address.fromBech32("drt1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssey5egf"),
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
            "08cc011209000de0b6b3a76400001a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e12205616c6963652a20b2a11555ce521e4944e09ab17549d85b487dcd26c84b5017a39e31a3670889ba32056361726f6c388094ebdc0340d08603520154580262405ac790366634a107930f4e47ef0e67b5e8f61503441bd38bc7cd12556f149b8edb43c08eedb7505e32e473f549ca598462388a11cecc917dd638968cd6178c06",
        );
    });
});
