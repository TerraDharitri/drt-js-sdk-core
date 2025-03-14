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
            receiver: "drt1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls6prdez",
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
            receiver: "drt1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls6prdez",
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
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2267456e574f65576d6d413063306a6b71764d354241707a61644b46574e534f69417643575163776d4750673d222c227265636569766572223a22414141414141414141414141415141414141414141414141414141414141414141414141414141432f2f383d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a22566e30744e364269687150476c59526f4b77696e455a6b4b6742706d76504d7a396e4d2b652b707635695175692b47344b36704447317030633235642b5852796c424c345a626d4679597a4a5830696a7672613641513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a327d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "6a4474e28873d965e46421e714a9a797be95cda78fac6c11791325b89806989261099c9dcef52712a54521f46b9bf3878273883d663df2a548438558e3ed180d",
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
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a227371455656633553486b6c45344a717864556e59573068397a536249533141586f3534786f32634969626f3d222c227265636569766572223a2241546c484c76396f686e63616d433877673970645168386b77704742356a6949496f3349484b594e6165453d222c2276616c7565223a313030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a225931376171763275666e43364e4367373132514957363046426853317949444e625267554e615a65384a705774372b3655652b574c6d63346943665a5738336b7470774b6464492b36484a6666335a645561687341673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "a6660b9cd898ca022fb61d9389904db58cc45937d796636ac06871c52a8a3a1879454e8adba9ee9e31153169aa22cf80193ff9f7963af2e2dc1e537f03f85c0f",
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
            "relayedTx@7b226e6f6e6365223a3230382c2273656e646572223a227371455656633553486b6c45344a717864556e59573068397a536249533141586f3534786f32634969626f3d222c227265636569766572223a2241546c484c76396f686e63616d433877673970645168386b77704742356a6949496f3349484b594e6165453d222c2276616c7565223a313939393939393030303030303030303030303030303030302c226761735072696365223a313030303030303030302c226761734c696d6974223a35303030302c2264617461223a22222c227369676e6174757265223a226d565a3931705266707143384179343264435075616c6b522b68394936454c765a57745133636b5661627673474a41693377742b334552676c496b476e724d4267584f42633679546c45684e7a6b756330374f7942513d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c22736e64557365724e616d65223a22593246796232773d222c22726376557365724e616d65223a22595778705932553d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "1e7c2ee6152881322bbd51213535508815aaa09988008927a785523dcfd4881bac720348d02fc5dd99cd1cdba2e15bf19dc9366d9ad46cfc897be3b8bec86608",
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
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2267456e574f65576d6d413063306a6b71764d354241707a61644b46574e534f69417643575163776d4750673d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225a3256305132397564484a68593352446232356d6157633d222c227369676e6174757265223a226c52366f3333423948656f34516f757a4b6b4542516b68372b4661774d55786d76453470354c5176776261634c6b515449562b6d6b4f66424370446d316961593870414c6b30503143722b6e756265467569683341773d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a22486f714c61306e655733766843716f56696c70715372744c5673774939535337586d7a563868477450684d3d222c22677561726469616e5369676e6174757265223a2235666d3844462b777752616d626432716b3972322b6b3856327277374c755a303173577873433669336c4f566547464e4a4a526478626b7243345a544a69553648597979584636356f503734736a476143434e5742513d3d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "fc25fddeb1027b9d692c65c24042b1753678fcee52048b98495ec1fe789b0dc8d9dcf489b417636477e50327fdb62a625d74e013eca12c1f008a7bc5141b5e02",
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
            "relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2267456e574f65576d6d413063306a6b71764d354241707a61644b46574e534f69417643575163776d4750673d222c227265636569766572223a22414141414141414141414146414b565841323879704877692f79693741364c64504b704f68464d386958513d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225957526b546e5674596d5679222c227369676e6174757265223a2244514d6651635a4c77472b34426562746535785875647765722b5931444e504c4f2b6666644e496b514e4f4178487a77534a6d575058466a6176326979314c7a764973673831346764375a51792b4d4973386b4f41673d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a322c226f7074696f6e73223a322c22677561726469616e223a22486f714c61306e655733766843716f56696c70715372744c5673774939535337586d7a563868477450684d3d222c22677561726469616e5369676e6174757265223a224e467666594d2b615950667a6a565341734a4f584c72542f357472732f76306d6d6553377a4e4e445136434b424d7062444d614f35752b307649646553452f485948653732444857397a7a41556b496a6559666143513d3d227d",
        );
        assert.equal(
            Buffer.from(relayedTransaction.signature).toString("hex"),
            "8a5dede58c168793bfb20aa097da484316707d5a5239482315e4e8eb3d96516686313495ed021b392e08fdd7e23207c19a1b0a560547c5c9d9224528656c770f",
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
            receiver: "drt1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls6prdez",
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
            "relayedTxV2@000000000000000000010000000000000000000000000000000000000002ffff@0f@676574436f6e7472616374436f6e666967@1703b6e2a855fd93a0758c15f80427ebceb695c0ef12ae613fae90fa9fcc105cf79391cad98f034efded0a72a6b312ce4e798804c81abee632e07bc7747fb40c",
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
            "a9d48c438ef44aec07a862546e52805325c8cabc691b81c48c082f5d11e30026358e85291d93081ad89bb25d944a6190cddb4bc8d949b5194e01056db28c930a",
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
