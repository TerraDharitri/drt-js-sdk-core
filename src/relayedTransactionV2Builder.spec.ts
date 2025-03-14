import { loadTestWallets, TestWallet } from "./testutils";
import { RelayedTransactionV2Builder } from "./relayedTransactionV2Builder";
import { Address } from "./address";
import { TransactionPayload } from "./transactionPayload";
import { assert } from "chai";
import { Transaction } from "./transaction";
import * as errors from "./errors";

describe("test relayed v2 transaction builder", function () {
    let alice: TestWallet, bob: TestWallet;

    before(async function () {
        ({ alice, bob } = await loadTestWallets());
    });

    it("should throw exception if args were not set", async function () {
        const builder = new RelayedTransactionV2Builder();
        assert.throw(() => builder.build(), errors.ErrInvalidRelayedV2BuilderArguments);
    });

    it("should throw exception if gas limit of the inner tx is not 0", async function () {
        let builder = new RelayedTransactionV2Builder();

        let networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };

        const innerTx = new Transaction({
            nonce: 15,
            sender: alice.address,
            receiver: Address.fromBech32("drt1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls6prdez"),
            gasLimit: 10,
            chainID: networkConfig.ChainID,
            data: new TransactionPayload("getContractConfig"),
        });
        builder = builder
            .setNetworkConfig(networkConfig)
            .setInnerTransactionGasLimit(10)
            .setInnerTransaction(innerTx)
            .setRelayerAddress(alice.address);
        assert.throw(() => builder.build(), errors.ErrGasLimitShouldBe0ForInnerTransaction);

        innerTx.setGasLimit({
            valueOf: function () {
                return 10;
            },
        });
        builder = builder.setNetworkConfig(networkConfig).setInnerTransactionGasLimit(10).setInnerTransaction(innerTx);
        assert.throw(() => builder.build(), errors.ErrGasLimitShouldBe0ForInnerTransaction);
    });

    it("should compute relayed v2 tx", async function () {
        let networkConfig = {
            MinGasLimit: 50_000,
            GasPerDataByte: 1_500,
            GasPriceModifier: 0.01,
            ChainID: "T",
        };

        const innerTx = new Transaction({
            nonce: 15,
            sender: bob.address,
            receiver: Address.fromBech32("drt1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls6prdez"),
            gasLimit: 0,
            chainID: networkConfig.ChainID,
            data: new TransactionPayload("getContractConfig"),
            version: 2,
        });

        innerTx.applySignature(await bob.signer.sign(innerTx.serializeForSigning()));

        const builder = new RelayedTransactionV2Builder();
        const relayedTxV2 = builder
            .setInnerTransaction(innerTx)
            .setInnerTransactionGasLimit(60_000_000)
            .setRelayerNonce(37)
            .setNetworkConfig(networkConfig)
            .setRelayerAddress(alice.getAddress())
            .build();

        relayedTxV2.setSender(alice.address);
        relayedTxV2.applySignature(await alice.signer.sign(relayedTxV2.serializeForSigning()));

        assert.equal(relayedTxV2.getNonce().valueOf(), 37);
        assert.equal(relayedTxV2.getVersion().valueOf(), 2);
        assert.equal(
            relayedTxV2.getData().toString(),
            "relayedTxV2@000000000000000000010000000000000000000000000000000000000002ffff@0f@676574436f6e7472616374436f6e666967@1703b6e2a855fd93a0758c15f80427ebceb695c0ef12ae613fae90fa9fcc105cf79391cad98f034efded0a72a6b312ce4e798804c81abee632e07bc7747fb40c",
        );
    });
});
