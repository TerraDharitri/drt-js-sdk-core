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
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2267456e574f65576d6d413063306a6b71764d354241707a61644b46574e534f69417643575163776d4750673d222c227265636569766572223a22497a4d4141414141414141414141414141414141414141434d7a41414141414141414141414141432f2f383d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a226236716b39577342437279675a7874386c5357516b30444631767475503778527a5a5152664976347751655951396458726e4539566a495478744c44684a4f4476444f386a53616e2b55594361754d2f574d453444513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a327d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "358f5d139c0ef2cb54ff8f48f9a81b317a894a424035118c8d44135999ebd487b8fb2f8f1c4b2c45df7e36d9d7d7aa7003c81ab6c84e131f39257997dc80bf0e",
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
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a227371455656633553486b6c45344a717864556e59573068397a536249533141586f3534786f32634969626f3d222c227265636569766572223a2241546c484c76396f686e63616d433877673970645168386b77704742356a6949496f3349484b594e6165453d222c2276616c7565223a313030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a225931376171763275666e43364e4367373132514957363046426853317949444e625267554e615a65384a705774372b3655652b574c6d63346943665a5738336b7470774b6464492b36484a6666335a645561687341673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "a6660b9cd898ca022fb61d9389904db58cc45937d796636ac06871c52a8a3a1879454e8adba9ee9e31153169aa22cf80193ff9f7963af2e2dc1e537f03f85c0f",
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
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a227371455656633553486b6c45344a717864556e59573068397a536249533141586f3534786f32634969626f3d222c227265636569766572223a2241546c484c76396f686e63616d433877673970645168386b77704742356a6949496f3349484b594e6165453d222c2276616c7565223a313939393939393030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a226d565a3931705266707143384179343264435075616c6b522b68394936454c765a57745133636b5661627673474a41693377742b334552676c496b476e724d4267584f42633679546c45684e7a6b756330374f7942513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "1e7c2ee6152881322bbd51213535508815aaa09988008927a785523dcfd4881bac720348d02fc5dd99cd1cdba2e15bf19dc9366d9ad46cfc897be3b8bec86608",
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
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2267456e574f65576d6d413063306a6b71764d354241707a61644b46574e534f69417643575163776d4750673d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a226c52366f3333423948656f34516f757a4b6b4542516b68372b4661774d55786d76453470354c5176776261634c6b515449562b6d6b4f66424370446d316961593870414c6b30503143722b6e756265467569683341773d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a22486f714c61306e655733766843716f56696c70715372744c5673774939535337586d7a563868477450684d3d222c22677561726469616e5369676e6174757265223a2235666d3844462b777752616d626432716b3972322b6b3856327277374c755a303173577873433669336c4f566547464e4a4a526478626b7243345a544a69553648597979584636356f503734736a476143434e5742513d3d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "fc25fddeb1027b9d692c65c24042b1753678fcee52048b98495ec1fe789b0dc8d9dcf489b417636477e50327fdb62a625d74e013eca12c1f008a7bc5141b5e02",
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
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2267456e574f65576d6d413063306a6b71764d354241707a61644b46574e534f69417643575163776d4750673d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225957526b546e5674596d5679222c227369676e6174757265223a2244514d6651635a4c77472b34426562746535785875647765722b5931444e504c4f2b6666644e496b514e4f4178487a77534a6d575058466a6176326979314c7a764973673831346764375a51792b4d4973386b4f41673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a22486f714c61306e655733766843716f56696c70715372744c5673774939535337586d7a563868477450684d3d222c22677561726469616e5369676e6174757265223a224e467666594d2b615950667a6a565341734a4f584c72542f357472732f76306d6d6553377a4e4e445136434b424d7062444d614f35752b307649646553452f485948653732444857397a7a41556b496a6559666143513d3d227d",
        );
        assert.equal(
            relayedTxV1.getSignature().toString("hex"),
            "8a5dede58c168793bfb20aa097da484316707d5a5239482315e4e8eb3d96516686313495ed021b392e08fdd7e23207c19a1b0a560547c5c9d9224528656c770f",
        );
    });
});
