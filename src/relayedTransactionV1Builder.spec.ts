import { assert } from "chai";
import { Address } from "./address";
import * as errors from "./errors";
import { TransactionOptions, TransactionVersion } from "./networkParams";
import { RelayedTransactionV1Builder } from "./relayedTransactionV1Builder";
import { Signature } from "./signature";
import { TestWallet, loadTestWallets } from "./testutils";
import { TokenTransfer } from "./tokenTransfer";
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
            ChainID: "T"
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
            ChainID: "T"
        };

        const innerTx = new Transaction({
            nonce: 198,
            sender: bob.address,
            receiver: Address.fromBech32("drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2"),
            gasLimit: 60000000,
            chainID: networkConfig.ChainID,
            data: new TransactionPayload("getContractConfig"),
        });

        await bob.signer.sign(innerTx);

        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(2627)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(alice.address)
            .build();

        await alice.signer.sign(relayedTxV1);

        assert.equal(relayedTxV1.getNonce().valueOf(), 2627);
        assert.equal(relayedTxV1.getData().toString(), "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22497a4d4141414141414141414141414141414141414141434d7a41414141414141414141414141432f2f383d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a2255414770744d4a63666531745375797557765a32766c72494c6b527451707176544c4e6b656b664c397a307a63536337706d566a4f76565158393948306f5849424436645368385a6a473465347a31627974545042673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a317d");
        assert.equal(relayedTxV1.getSignature().toString("hex"), "53902f7cfdffe9a78d8998f00f273e0e1116d4eb891dbf5b9c8686a7ced29eecb1683ce2784e8ad683b1b6ce89df6475ecdc72f8260afed132406f239e35bf00");
    });

    it("should compute relayed v1 transaction (with usernames)", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T"
        };

        const innerTx = new Transaction({
            nonce: 208,
            value: TokenTransfer.rewaFromAmount(1),
            sender: carol.address,
            receiver: alice.address,
            senderUsername: "carol",
            receiverUsername: "alice",
            gasLimit: 50000,
            chainID: networkConfig.ChainID
        });

        await carol.signer.sign(innerTx);

        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(715)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(frank.address)
            .build();

        await frank.signer.sign(relayedTxV1);

        assert.equal(relayedTxV1.getNonce().valueOf(), 715);
        assert.equal(relayedTxV1.getData().toString(), "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a2273462f6c4e634a2f527045666450693338675563565065532f4b434d65724938552b642b7a7330733253673d222c227265636569766572223a2278344a434155546f4b57393163796930436441574d372b4e4364697245653577307977675432574a7653513d222c2276616c7565223a313030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a2270515163762f312f314830376458524a484b456435585570616b4d61376f59495067346941433868743832723451362f5478773867687049646a4a4f343249573938356d4a4d754d6b31746a50306d6c5431616143513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a312c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d");
        assert.equal(relayedTxV1.getSignature().toString("hex"), "a68266bf6d37251d7d7d45fb9f9d625a4f5c86a52d0928492d8bd936f34c7d50dcac4688fb3b249eded85e341fd57109b3aeba65e7ffcf4cefb68c89388d3b09");
    });

    it("should compute guarded inner Tx - relayed v1 transaction", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T"
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
            options: TransactionOptions.withOptions({ guarded: true })
        });

        await bob.signer.sign(innerTx);
        innerTx.applyGuardianSignature(new Signature("c72e08622c86d9b6889fb9f33eed75c6a04a940daa012825464c6ccaad71640cfcf5c4d38b36fb0575345bbec90daeb2db7a423bfb5253cef0ddc5c87d1b5f04"));

        const builder = new RelayedTransactionV1Builder();
        const relayedTxV1 = builder
            .setInnerTransaction(innerTx)
            .setRelayerNonce(2627)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(alice.address)
            .build();

        await alice.signer.sign(relayedTxV1);

        assert.equal(relayedTxV1.getNonce().valueOf(), 2627);
        assert.equal(relayedTxV1.getData().toString(), "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a223534646e2b7a726d737832304e67793838756f462b72546f443179447030524b563966714462574a5947365a784a33544132516377554a49426168704a52394d322b487637694a2f446f726c533863684973777143513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a2273673076774659474759786e4847666f50566365784c6e704163476c72715536756459476b3676427a2b513d222c22677561726469616e5369676e6174757265223a227879344959697947326261496e376e7a507531317871424b6c4132714153676c526b7873797131785a417a3839635454697a6237425855305737374a44613679323370434f2f745355383777336358496652746642413d3d227d");
        assert.equal(relayedTxV1.getSignature().toString("hex"), "9e5b4787e801866bd748af116a3da2429571e13d0abdd0ad746e2aee6c97580b27af4c0cdecf26a171ea479f13f37976aee61bf84d74f39df87030e70710be04");
    });

    it("should compute guarded inner tx and guarded relayed v1 transaction", async function () {
        const networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T"
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
            options: TransactionOptions.withOptions({ guarded: true })
        });

        await bob.signer.sign(innerTx);
        innerTx.applyGuardianSignature(new Signature("b12d08732c86d9b6889fb9f33eed65c6a04a960daa012825464c6ccaad71640cfcf5c4d38b36fb0575345bbec90daeb2db7a423bfb5253cef0ddc5c87d1b5f04"));

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

        await alice.signer.sign(relayedTxV1);
        relayedTxV1.applyGuardianSignature(new Signature("d32c08722c86d9b6889fb9f33eed65c6a04a970daa012825464c6ccaad71640cfcf5c4d38b36fb0575345bbec90daeb2db7a423bfb5253cef0ddc5c87d1b5f04"));

        assert.equal(relayedTxV1.getNonce().valueOf(), 2627);
        assert.equal(relayedTxV1.getData().toString(), "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2250643858504a3443774f5750736556533948505a6a61616b772f493866674e4d6b533770696f33647a68633d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225957526b546e5674596d5679222c227369676e6174757265223a227a7a506a436a62676f7a62615348354655796e53484362663534514c38545635726c32722b6a4c486b4b37422f2b674f4151454e764e636d4d784a705745694c62716c4e5a35634f6b305563637a66326251716d44513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a2273673076774659474759786e4847666f50566365784c6e704163476c72715536756459476b3676427a2b513d222c22677561726469616e5369676e6174757265223a227353304963797947326261496e376e7a5075316c7871424b6c6732714153676c526b7873797131785a417a3839635454697a6237425855305737374a44613679323370434f2f745355383777336358496652746642413d3d227d");
        assert.equal(relayedTxV1.getSignature().toString("hex"), "655e477424a36e7bcf23b6461ea4b04b53abdae8146f2b8a744dab0bd05f8be095bccfde377938cff38f8c3cdbc354243244a29614a02711f26d39b8699f0a00");
    });
});
