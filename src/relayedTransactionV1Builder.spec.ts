import { loadTestWallets, TestWallet } from "./testutils";
import { assert} from "chai";
import * as errors from "./errors";
import { RelayedTransactionV1Builder } from "./relayedTransactionV1Builder";
import { Transaction } from "./transaction";
import { Address } from "./address";
import { TransactionPayload } from "./transactionPayload";

describe("test relayed v1 transaction builder", function () {
    let alice: TestWallet, bob: TestWallet;

    before(async function () {
        ({alice, bob} = await loadTestWallets());
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
        assert.equal(relayedTxV1.getSignature().hex(), "53902f7cfdffe9a78d8998f00f273e0e1116d4eb891dbf5b9c8686a7ced29eecb1683ce2784e8ad683b1b6ce89df6475ecdc72f8260afed132406f239e35bf00");
    });
});
