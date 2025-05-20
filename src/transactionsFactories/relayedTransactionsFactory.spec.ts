import { assert } from "chai";
import { TestWallet, loadTestWallets } from "../testutils";
import { Transaction } from "../transaction";
import { TransactionComputer } from "../transactionComputer";
import { RelayedTransactionsFactory } from "./relayedTransactionsFactory";
import { TransactionsFactoryConfig } from "./transactionsFactoryConfig";

describe("test relayed transactions factory", function () {
    const config = new TransactionsFactoryConfig({ chainID: "T" });
    const factory = new RelayedTransactionsFactory({ config: config });
    const transactionComputer = new TransactionComputer();
    let alice: TestWallet, bob: TestWallet, carol: TestWallet, grace: TestWallet, frank: TestWallet;

    before(async function () {
        ({ alice, bob, carol, grace, frank } = await loadTestWallets());
    });

    it("should throw exception when creating relayed v1 transaction with invalid inner transaction", async function () {
        let innerTransaction = new Transaction({
            sender: alice.address.bech32(),
            receiver: "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2",
            gasLimit: 10000000n,
            data: Buffer.from("getContractConfig"),
            chainID: config.chainID,
        });

        assert.throws(() => {
            factory.createRelayedV1Transaction({ innerTransaction: innerTransaction, relayerAddress: bob.address }),
                "The inner transaction is not signed";
        });

        innerTransaction.gasLimit = 0n;
        innerTransaction.signature = Buffer.from("invalidsignature");

        assert.throws(() => {
            factory.createRelayedV1Transaction({ innerTransaction: innerTransaction, relayerAddress: bob.address }),
                "The gas limit is not set for the inner transaction";
        });
    });

    it("should create relayed v1 transaction", async function () {
        let innerTransaction = new Transaction({
            sender: bob.address.bech32(),
            receiver: "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2",
            gasLimit: 60000000n,
            data: Buffer.from("getContractConfig"),
            chainID: config.chainID,
            nonce: 198n,
        });

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await bob.signer.sign(serializedInnerTransaction);

        const relayedTransaction = factory.createRelayedV1Transaction({
            innerTransaction: innerTransaction,
            relayerAddress: alice.address,
        });
        relayedTransaction.nonce = 2627n;

        const serializedRelayedTransaction = transactionComputer.computeBytesForSigning(relayedTransaction);
        relayedTransaction.signature = await alice.signer.sign(serializedRelayedTransaction);

        assert.equal(
            Buffer.from(relayedTransaction.data).toString(),
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22497a4d4141414141414141414141414141414141414141434d7a41414141414141414141414141432f2f383d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a22662f583030554a394e45755239345a7147316c7369514730755a4349724256513247566b66494b5972422f2b36586c4f6f43583550654d6d664953547957614c37376c6e5547336e397245627a7037743537396342673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a327d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "724f97113a8f2b5851c1c5d918e06465cc0562f1d9c691ea94cb0a4f0b4633ff67e6769fed9c87d0d2a6518d924823b0310d721968bf37a42720cab382710d06",
        );
    });

    it("should create relayed v1 transaction with usernames", async function () {
        let innerTransaction = new Transaction({
            sender: carol.address.bech32(),
            receiver: alice.address.bech32(),
            gasLimit: 50000n,
            chainID: config.chainID,
            nonce: 208n,
            senderUsername: "carol",
            receiverUsername: "alice",
            value: 1000000000000000000n,
        });

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await carol.signer.sign(serializedInnerTransaction);

        const relayedTransaction = factory.createRelayedV1Transaction({
            innerTransaction: innerTransaction,
            relayerAddress: frank.address,
        });
        relayedTransaction.nonce = 715n;

        const serializedRelayedTransaction = transactionComputer.computeBytesForSigning(relayedTransaction);
        relayedTransaction.signature = await frank.signer.sign(serializedRelayedTransaction);

        assert.equal(
            Buffer.from(relayedTransaction.data).toString(),
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a2273462f6c4e634a2f527045666450693338675563565065532f4b434d65724938552b642b7a7330733253673d222c227265636569766572223a2278344a434155546f4b57393163796930436441574d372b4e4364697245653577307977675432574a7653513d222c2276616c7565223a313030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a2259594156326c65624a67487a686c4b6d72586a575450427a4e6154522f4e4e31565845714b457a5a78525a3030393738756a6539564b486e6b383153654a416931666a3979394d7a4d393263554b44463943395941673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "86c344f26dc7e223b039044b8f950d6597f758715969170b506c069e3bc25254bf7bffd5bdf564d4547f8c153a9962358138727be39726c527226be309430f0a",
        );
    });

    it("should create relayed v1 transaction with big value", async function () {
        let innerTransaction = new Transaction({
            sender: carol.address.bech32(),
            receiver: alice.address.bech32(),
            gasLimit: 50000n,
            chainID: config.chainID,
            nonce: 208n,
            senderUsername: "carol",
            receiverUsername: "alice",
            value: 1999999000000000000000000n,
        });

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await carol.signer.sign(serializedInnerTransaction);

        const relayedTransaction = factory.createRelayedV1Transaction({
            innerTransaction: innerTransaction,
            relayerAddress: frank.address,
        });
        relayedTransaction.nonce = 715n;

        const serializedRelayedTransaction = transactionComputer.computeBytesForSigning(relayedTransaction);
        relayedTransaction.signature = await frank.signer.sign(serializedRelayedTransaction);

        assert.equal(
            Buffer.from(relayedTransaction.data).toString(),
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a2273462f6c4e634a2f527045666450693338675563565065532f4b434d65724938552b642b7a7330733253673d222c227265636569766572223a2278344a434155546f4b57393163796930436441574d372b4e4364697245653577307977675432574a7653513d222c2276616c7565223a313939393939393030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a22313567445a534b5444756c4b4e6d376a53327a7378485950744f50507757596b743162792f6b6e6e567862313746497438496e626c7436716d43623531546f31785975736b4e366936653555736f795a7043513943513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "e309ff671ab1fd9d73b4c980e9653623b8e5767d9430caaf2d75fcd71c9fca81a3d7bcfb6cf40aca15a776e90b052b58ca08ea0321c678a2858aba4ffe52ed0f",
        );
    });

    it("should create relayed v1 transaction with guarded inner transaction", async function () {
        let innerTransaction = new Transaction({
            sender: bob.address.bech32(),
            receiver: "drt1qqqqqqqqqqqqqpgq54tsxmej537z9leghvp69hfu4f8gg5eu396q6dlssu",
            gasLimit: 60000000n,
            chainID: config.chainID,
            data: Buffer.from("getContractConfig"),
            nonce: 198n,
            version: 2,
            options: 2,
            guardian: grace.address.bech32(),
        });

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await bob.signer.sign(serializedInnerTransaction);
        innerTransaction.guardianSignature = await grace.signer.sign(serializedInnerTransaction);

        const relayedTransaction = factory.createRelayedV1Transaction({
            innerTransaction: innerTransaction,
            relayerAddress: alice.address,
        });
        relayedTransaction.nonce = 2627n;

        const serializedRelayedTransaction = transactionComputer.computeBytesForSigning(relayedTransaction);
        relayedTransaction.signature = await alice.signer.sign(serializedRelayedTransaction);

        assert.equal(
            Buffer.from(relayedTransaction.data).toString(),
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a223534646e2b7a726d737832304e67793838756f462b72546f443179447030524b563966714462574a5947365a784a33544132516377554a49426168704a52394d322b487637694a2f446f726c533863684973777143513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a2273673076774659474759786e4847666f50566365784c6e704163476c72715536756459476b3676427a2b513d222c22677561726469616e5369676e6174757265223a2250382f395a59483768614833314763337241396139774771326b6c5a6e2f76616978656f7954742f707336752f6769515757754a583650344a54735a58566f4e744c57595a744554376e2b30723761556155504443773d3d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "357c4d189dfe71398e80e4f04d10c823f94eacd96b9dc304d4a67ccff5832c6a71e54eec0181f881b862da0347ad99fee2773ce1b5776a35ac25247384a37707",
        );
    });

    it("should create guarded relayed v1 transaction with guarded inner transaction", async function () {
        let innerTransaction = new Transaction({
            sender: bob.address.bech32(),
            receiver: "drt1qqqqqqqqqqqqqpgq54tsxmej537z9leghvp69hfu4f8gg5eu396q6dlssu",
            gasLimit: 60000000n,
            chainID: config.chainID,
            data: Buffer.from("addNumber"),
            nonce: 198n,
            version: 2,
            options: 2,
            guardian: grace.address.bech32(),
        });

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await bob.signer.sign(serializedInnerTransaction);
        innerTransaction.guardianSignature = await grace.signer.sign(serializedInnerTransaction);

        const relayedTransaction = factory.createRelayedV1Transaction({
            innerTransaction: innerTransaction,
            relayerAddress: alice.address,
        });
        relayedTransaction.nonce = 2627n;
        relayedTransaction.options = 2;
        relayedTransaction.guardian = frank.address.bech32();

        const serializedRelayedTransaction = transactionComputer.computeBytesForSigning(relayedTransaction);
        relayedTransaction.signature = await alice.signer.sign(serializedRelayedTransaction);
        relayedTransaction.guardianSignature = await frank.signer.sign(serializedRelayedTransaction);

        assert.equal(
            Buffer.from(relayedTransaction.data).toString(),
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225957526b546e5674596d5679222c227369676e6174757265223a227a7a506a436a62676f7a62615348354655796e53484362663534514c38545635726c32722b6a4c486b4b37422f2b674f4151454e764e636d4d784a705745694c62716c4e5a35634f6b305563637a66326251716d44513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a2273673076774659474759786e4847666f50566365784c6e704163476c72715536756459476b3676427a2b513d222c22677561726469616e5369676e6174757265223a22436f79665045623959312b5867413943762f42704f6370455a516f3347676d4442575a52714c7a773732343132686470444e362b6a7669325777676d306148756c412b7970382f6b4575673566346d715179466344673d3d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "cba1922740567512e09bb0499d875bb9407c2736ce1fd42247d76eb5149050ca33dd1dc7ebfbbf13e90d818407ab6025699346d7b0369be3cf483c335883e702",
        );
    });

    it("should throw exception when creating relayed v2 transaction with invalid inner transaction", async function () {
        let innerTransaction = new Transaction({
            sender: bob.address.bech32(),
            receiver: bob.address.bech32(),
            gasLimit: 50000n,
            chainID: config.chainID,
        });

        assert.throws(() => {
            factory.createRelayedV2Transaction({
                innerTransaction: innerTransaction,
                innerTransactionGasLimit: 50000n,
                relayerAddress: carol.address,
            }),
                "The gas limit should not be set for the inner transaction";
        });

        innerTransaction.gasLimit = 0n;

        assert.throws(() => {
            factory.createRelayedV2Transaction({
                innerTransaction: innerTransaction,
                innerTransactionGasLimit: 50000n,
                relayerAddress: carol.address,
            }),
                "The inner transaction is not signed";
        });
    });

    it("should create relayed v2 transaction", async function () {
        let innerTransaction = new Transaction({
            sender: bob.address.bech32(),
            receiver: "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2",
            gasLimit: 0n,
            chainID: config.chainID,
            data: Buffer.from("getContractConfig"),
            nonce: 15n,
            version: 2,
            options: 0,
        });

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await bob.signer.sign(serializedInnerTransaction);

        const relayedTransaction = factory.createRelayedV2Transaction({
            innerTransaction: innerTransaction,
            innerTransactionGasLimit: 60000000n,
            relayerAddress: alice.address,
        });
        relayedTransaction.nonce = 37n;

        const serializedRelayedTransaction = transactionComputer.computeBytesForSigning(relayedTransaction);
        relayedTransaction.signature = await alice.signer.sign(serializedRelayedTransaction);

        assert.equal(relayedTransaction.version, 2);
        assert.equal(relayedTransaction.options, 0);
        assert.equal(relayedTransaction.gasLimit.toString(), "60414500");
        assert.equal(
            Buffer.from(relayedTransaction.data).toString(),
            "relayedTxV2@233300000000000000000000000000000002333000000000000000000002ffff@0f@676574436f6e7472616374436f6e666967@374aa9bd1f21f05483a7be10d1262d07e73f822f93d7918fea4f041296161b163900bd375c8d345afd97eac521251a5f279e4fc7c18146ae51477934ddd2550f",
        );
    });

    it("should create relayed v3 transaction", async function () {
        let innerTransaction = new Transaction({
            sender: bob.address.toBech32(),
            receiver: bob.address.toBech32(),
            gasLimit: 50000n,
            chainID: config.chainID,
            nonce: 0n,
            version: 2,
            relayer: alice.address.toBech32(),
        });

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await bob.signer.sign(serializedInnerTransaction);

        const relayedTransaction = factory.createRelayedV3Transaction({
            relayerAddress: alice.address,
            innerTransactions: [innerTransaction],
        });

        const serializedRelayedTransaction = transactionComputer.computeBytesForSigning(relayedTransaction);
        relayedTransaction.signature = await alice.signer.sign(serializedRelayedTransaction);

        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "be248e19b2a315c6e18daab28005e9e8f7c2f13ca8e13e3028e58f6054606c0a5db9953568856880668858050036593e923df607e59cf6d9314b0d291d25560c",
        );
        assert.equal(relayedTransaction.gasLimit, 100000n);
    });

    it("should fail to create relayed v3 transaction", async function () {
        assert.throws(() => {
            factory.createRelayedV3Transaction({
                relayerAddress: alice.address,
                innerTransactions: [],
            });
        }, "No inner transctions provided");

        const innerTransaction = new Transaction({
            sender: bob.address.toBech32(),
            receiver: bob.address.toBech32(),
            gasLimit: 50000n,
            chainID: config.chainID,
            nonce: 0n,
            version: 2,
            relayer: carol.address.toBech32(),
        });

        assert.throws(() => {
            factory.createRelayedV3Transaction({
                relayerAddress: alice.address,
                innerTransactions: [innerTransaction],
            });
        }, "Inner transaction is not signed");

        const serializedInnerTransaction = transactionComputer.computeBytesForSigning(innerTransaction);
        innerTransaction.signature = await bob.signer.sign(serializedInnerTransaction);

        assert.throws(() => {
            factory.createRelayedV3Transaction({
                relayerAddress: alice.address,
                innerTransactions: [innerTransaction],
            });
        }, "The inner transaction has an incorrect relayer address");
    });
});
