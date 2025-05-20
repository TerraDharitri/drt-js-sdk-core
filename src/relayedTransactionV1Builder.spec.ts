import { assert } from "chai";
import { Address } from "./address";
import * as errors from "./errors";
import { TransactionOptions, TransactionVersion } from "./networkParams";
import { RelayedTransactionV1Builder } from "./relayedTransactionV1Builder";
import { TestWallet, loadTestWallets } from "./testutils";
import { TokenTransfer } from "./tokens";
import { Transaction } from "./transaction";
import { TransactionPayload } from "./transactionPayload";

describe("test relayed v1 transaction builder", function () {
    let alice: TestWallet, bob: TestWallet, carol: TestWallet, grace: TestWallet, frank: TestWallet;

    before(async function () {
        ({ alice, bob, carol, grace, frank } = await loadTestWallets());
    });

    it("should throw exception if args were not set", async function () {
        const builder = new RelayedTransactionV1Builder();
        assert.throw(() => builder.build(), errors.ErrInvalidRelayedV1BuilderArguments);

        const innerTx = new Transaction({
            nonce: 15,
            sender: alice.address,
            receiver: Address.fromBech32("drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2"),
            gasLimit: 10000000,
            chainID: "1",
            data: new TransactionPayload("getContractConfig"),
        });
        builder.setInnerTransaction(innerTx);
        assert.throw(() => builder.build(), errors.ErrInvalidRelayedV1BuilderArguments);

        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };
        builder.setNetworkConfig(networkConfig);
        assert.throw(() => builder.build(), errors.ErrInvalidRelayedV1BuilderArguments);

        builder.setRelayerAddress(alice.getAddress());
        assert.doesNotThrow(() => builder.build());
    });

    it("should compute relayed v1 transaction", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };

        const innerTx = new Transaction({
            nonce: 198,
            sender: bob.address,
            receiver: Address.fromBech32("drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2"),
            gasLimit: 60000000,
            chainID: networkConfig.ChainID,
            data: new TransactionPayload("getContractConfig"),
        });

        innerTx.applySignature(await bob.signer.sign(innerTx.serializeForSigning()));

        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(2627)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(alice.address)
            .build();

        relayedTxV1.applySignature(await alice.signer.sign(relayedTxV1.serializeForSigning()));

        assert.equal(relayedTxV1.getNonce().valueOf(), 2627);
        assert.equal(
            relayedTxV1.getData().toString(),
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22497a4d4141414141414141414141414141414141414141434d7a41414141414141414141414141432f2f383d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a22662f583030554a394e45755239345a7147316c7369514730755a4349724256513247566b66494b5972422f2b36586c4f6f43583550654d6d664953547957614c37376c6e5547336e397245627a7037743537396342673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a327d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "724f97113a8f2b5851c1c5d918e06465cc0562f1d9c691ea94cb0a4f0b4633ff67e6769fed9c87d0d2a6518d924823b0310d721968bf37a42720cab382710d06",
        );
    });

    it("should compute relayed v1 transaction (with usernames)", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };

        const innerTx = new Transaction({
            nonce: 208,
            value: TokenTransfer.rewaFromAmount(1),
            sender: carol.address,
            receiver: alice.address,
            senderUsername: "carol",
            receiverUsername: "alice",
            gasLimit: 50000,
            chainID: networkConfig.ChainID,
        });

        innerTx.applySignature(await carol.signer.sign(innerTx.serializeForSigning()));

        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(715)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(frank.address)
            .build();

        relayedTxV1.applySignature(await frank.signer.sign(relayedTxV1.serializeForSigning()));

        assert.equal(relayedTxV1.getNonce().valueOf(), 715);
        assert.equal(
            relayedTxV1.getData().toString(),
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a2273462f6c4e634a2f527045666450693338675563565065532f4b434d65724938552b642b7a7330733253673d222c227265636569766572223a2278344a434155546f4b57393163796930436441574d372b4e4364697245653577307977675432574a7653513d222c2276616c7565223a313030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a2259594156326c65624a67487a686c4b6d72586a575450427a4e6154522f4e4e31565845714b457a5a78525a3030393738756a6539564b486e6b383153654a416931666a3979394d7a4d393263554b44463943395941673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "86c344f26dc7e223b039044b8f950d6597f758715969170b506c069e3bc25254bf7bffd5bdf564d4547f8c153a9962358138727be39726c527226be309430f0a",
        );
    });

    it("should compute relayed v1 transaction with big value", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };

        const innerTx = new Transaction({
            nonce: 208,
            value: TokenTransfer.rewaFromAmount(1999999),
            sender: carol.address,
            receiver: alice.address,
            senderUsername: "carol",
            receiverUsername: "alice",
            gasLimit: 50000,
            chainID: networkConfig.ChainID,
        });

        innerTx.applySignature(await carol.signer.sign(innerTx.serializeForSigning()));

        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(715)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(frank.address)
            .build();

        relayedTxV1.applySignature(await frank.signer.sign(relayedTxV1.serializeForSigning()));

        assert.equal(relayedTxV1.getNonce().valueOf(), 715);
        assert.equal(
            relayedTxV1.getData().toString(),
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a2273462f6c4e634a2f527045666450693338675563565065532f4b434d65724938552b642b7a7330733253673d222c227265636569766572223a2278344a434155546f4b57393163796930436441574d372b4e4364697245653577307977675432574a7653513d222c2276616c7565223a313939393939393030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a22313567445a534b5444756c4b4e6d376a53327a7378485950744f50507757596b743162792f6b6e6e567862313746497438496e626c7436716d43623531546f31785975736b4e366936653555736f795a7043513943513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "e309ff671ab1fd9d73b4c980e9653623b8e5767d9430caaf2d75fcd71c9fca81a3d7bcfb6cf40aca15a776e90b052b58ca08ea0321c678a2858aba4ffe52ed0f",
        );
    });

    it("should compute guarded inner Tx - relayed v1 transaction", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };

        const innerTx = new Transaction({
            nonce: 198,
            sender: bob.address,
            receiver: Address.fromBech32("drt1qqqqqqqqqqqqqpgq54tsxmej537z9leghvp69hfu4f8gg5eu396q6dlssu"),
            gasLimit: 60000000,
            chainID: networkConfig.ChainID,
            data: new TransactionPayload("getContractConfig"),
            guardian: grace.address,
            version: TransactionVersion.withTxOptions(),
            options: TransactionOptions.withOptions({ guarded: true }),
        });

        innerTx.applySignature(await bob.signer.sign(innerTx.serializeForSigning()));
        innerTx.applyGuardianSignature(await grace.signer.sign(innerTx.serializeForSigning()));

        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(2627)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(alice.address)
            .build();

        relayedTxV1.applySignature(await alice.signer.sign(relayedTxV1.serializeForSigning()));

        assert.equal(relayedTxV1.getNonce().valueOf(), 2627);
        assert.equal(
            relayedTxV1.getData().toString(),
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a223534646e2b7a726d737832304e67793838756f462b72546f443179447030524b563966714462574a5947365a784a33544132516377554a49426168704a52394d322b487637694a2f446f726c533863684973777143513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a2273673076774659474759786e4847666f50566365784c6e704163476c72715536756459476b3676427a2b513d222c22677561726469616e5369676e6174757265223a2250382f395a59483768614833314763337241396139774771326b6c5a6e2f76616978656f7954742f707336752f6769515757754a583650344a54735a58566f4e744c57595a744554376e2b30723761556155504443773d3d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "357c4d189dfe71398e80e4f04d10c823f94eacd96b9dc304d4a67ccff5832c6a71e54eec0181f881b862da0347ad99fee2773ce1b5776a35ac25247384a37707",
        );
    });

    it("should compute guarded inner tx and guarded relayed v1 transaction", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };

        const innerTx = new Transaction({
            nonce: 198,
            sender: bob.address,
            receiver: Address.fromBech32("drt1qqqqqqqqqqqqqpgq54tsxmej537z9leghvp69hfu4f8gg5eu396q6dlssu"),
            gasLimit: 60000000,
            chainID: networkConfig.ChainID,
            data: new TransactionPayload("addNumber"),
            guardian: grace.address,
            version: TransactionVersion.withTxOptions(),
            options: TransactionOptions.withOptions({ guarded: true }),
        });

        innerTx.applySignature(await bob.signer.sign(innerTx.serializeForSigning()));
        innerTx.applyGuardianSignature(await grace.signer.sign(innerTx.serializeForSigning()));
        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(2627)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(alice.address)
            .setRelayedTransactionVersion(TransactionVersion.withTxOptions())
            .setRelayedTransactionOptions(TransactionOptions.withOptions({ guarded: true }))
            .setRelayedTransactionGuardian(frank.address)
            .build();

        relayedTxV1.applySignature(await alice.signer.sign(relayedTxV1.serializeForSigning()));
        relayedTxV1.applyGuardianSignature(await frank.signer.sign(relayedTxV1.serializeForSigning()));

        assert.equal(relayedTxV1.getNonce().valueOf(), 2627);
        assert.equal(
            relayedTxV1.getData().toString(),
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225957526b546e5674596d5679222c227369676e6174757265223a227a7a506a436a62676f7a62615348354655796e53484362663534514c38545635726c32722b6a4c486b4b37422f2b674f4151454e764e636d4d784a705745694c62716c4e5a35634f6b305563637a66326251716d44513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a2273673076774659474759786e4847666f50566365784c6e704163476c72715536756459476b3676427a2b513d222c22677561726469616e5369676e6174757265223a22436f79665045623959312b5867413943762f42704f6370455a516f3347676d4442575a52714c7a773732343132686470444e362b6a7669325777676d306148756c412b7970382f6b4575673566346d715179466344673d3d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "cba1922740567512e09bb0499d875bb9407c2736ce1fd42247d76eb5149050ca33dd1dc7ebfbbf13e90d818407ab6025699346d7b0369be3cf483c335883e702",
        );
    });
});
