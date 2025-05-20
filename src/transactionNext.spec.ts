import { assert } from "chai";
import { TestWallet, loadTestWallets } from "./testutils";
import { TransactionNext, TransactionComputer, Transaction } from "./transaction";
import { ProtoSerializer } from "./proto";

class NetworkConfig {
    MinGasLimit: number;
    GasPerDataByte: number;
    GasPriceModifier: number;
    ChainID: string;

    constructor(minGasLimit: number = 50000) {
        this.MinGasLimit = minGasLimit;
        this.GasPerDataByte = 1500;
        this.GasPriceModifier = 0.01;
        this.ChainID = "D";
    }
}

describe("test transaction next", async () => {
    let wallets: Record<string, TestWallet>;
    const networkConfig = new NetworkConfig();
    const transactionComputer = new TransactionComputer();

    before(async function () {
        wallets = await loadTestWallets();
    });

    it("should serialize transaction for signing", async () => {
        const sender = "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l";
        const receiver = "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2";

        let transaction = new TransactionNext({
            chainID: networkConfig.ChainID,
            sender: sender,
            receiver: receiver,
            gasLimit: 50000n,
            value: 0n,
            version: 2,
            nonce: 89n,
        });

        let serializedTransactionBytes = transactionComputer.computeBytesForSigning(transaction);
        let serializedTransaction = Buffer.from(serializedTransactionBytes).toString();

        assert.equal(
            serializedTransaction,
            `{"nonce":89,"value":"0","receiver":"drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2","sender":"drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l","gasPrice":1000000000,"gasLimit":50000,"chainID":"D","version":2}`,
        );

        transaction = new TransactionNext({
            chainID: networkConfig.ChainID,
            sender: sender,
            receiver: receiver,
            gasLimit: 70000n,
            value: 1000000000000000000n,
            version: 2,
            nonce: 90n,
            data: new Uint8Array(Buffer.from("hello")),
        });

        serializedTransactionBytes = transactionComputer.computeBytesForSigning(transaction);
        serializedTransaction = Buffer.from(serializedTransactionBytes).toString();

        assert.equal(
            serializedTransaction,
            `{"nonce":90,"value":"1000000000000000000","receiver":"drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2","sender":"drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l","gasPrice":1000000000,"gasLimit":70000,"data":"aGVsbG8=","chainID":"D","version":2}`,
        );
    });

    it("should serialize transaction with usernames", async () => {
        const transaction = new TransactionNext({
            chainID: "T",
            sender: wallets.carol.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 50000n,
            value: 1000000000000000000n,
            version: 2,
            nonce: 204n,
            senderUsername: "carol",
            receiverUsername: "alice",
        });

        transaction.signature = await wallets.carol.signer.sign(
            Buffer.from(transactionComputer.computeBytesForSigning(transaction)),
        );
        console.log(Buffer.from(transaction.signature).toString("hex"));

        assert.equal(
            Buffer.from(transaction.signature).toString("hex"),
            "d335ef8f4f56ba2c6647e0e7835d5aec751449f0b3fd91125cce42de9440fdb7ab7be51b754b42cad97a0d8c1c1263cb5dab97c63b315f03b82f08618abc2000",
        );
    });

    it("should compute transaction hash", async () => {
        const transaction = new TransactionNext({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 100000n,
            value: 1000000000000n,
            version: 2,
            nonce: 17243n,
            data: Buffer.from("testtx"),
        });
        transaction.signature = Buffer.from(
            "eaa9e4dfbd21695d9511e9754bde13e90c5cfb21748a339a79be11f744c71872e9fe8e73c6035c413f5f08eef09e5458e9ea6fc315ff4da0ab6d000b450b2a07",
            "hex",
        );

        const hash = transactionComputer.computeTransactionHash(transaction);
        assert.equal(
            Buffer.from(hash).toString("hex"),
            "0e9c4640b4e63f8d858c8947c335962fd3199cebf01cc0c391521bdaa0062428",
        );
    });

    it("should compute transaction hash with usernames", async () => {
        const transaction = new TransactionNext({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 100000n,
            value: 1000000000000n,
            version: 2,
            nonce: 17244n,
            data: Buffer.from("testtx"),
            senderUsername: "alice",
            receiverUsername: "alice",
        });
        transaction.signature = Buffer.from(
            "807bcd7de5553ea6dfc57c0510e84d46813c5963d90fec50991c500091408fcf6216dca48dae16a579a1611ed8b2834bae8bd0027dc17eb557963f7151b82c07",
            "hex",
        );

        const hash = transactionComputer.computeTransactionHash(transaction);
        assert.equal(
            Buffer.from(hash).toString("hex"),
            "8ff6449ddaf699292178078f2d5e5cdb67ddfc69fc177d5ae326ebe587db880c",
        );
    });

    it("should throw `NotEnoughGas` error", async () => {
        const transaction = new TransactionNext({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 50000n,
            data: Buffer.from("toolittlegaslimit"),
        });

        assert.throws(() => {
            transactionComputer.computeTransactionFee(transaction, networkConfig);
        });
    });

    it("should compute transaction fee", async () => {
        const transaction = new TransactionNext({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 20n,
            gasPrice: 500n,
        });

        const config = new NetworkConfig(10);
        const gasLimit = transactionComputer.computeTransactionFee(transaction, config);
        assert.equal(gasLimit.toString(), "5050");
    });

    it("should compute transaction fee for transaction with data field", async () => {
        const transaction = new TransactionNext({
            chainID: networkConfig.ChainID,
            sender: wallets.alice.address.bech32(),
            receiver: wallets.alice.address.bech32(),
            gasLimit: 12010n,
            gasPrice: 500n,
            data: Buffer.from("testdata"),
        });

        const config = new NetworkConfig(10);
        const gasLimit = transactionComputer.computeTransactionFee(transaction, config);
        assert.equal(gasLimit.toString(), "6005000");
    });

    it("should compute guarded transaction", async () => {
        const alice = wallets.alice;

        const transaction = new TransactionNext({
            chainID: "local-testnet",
            sender: alice.address.bech32(),
            receiver: wallets.bob.address.bech32(),
            gasLimit: 150000n,
            gasPrice: 1000000000n,
            data: new Uint8Array(Buffer.from("test data field")),
            version: 2,
            options: 2,
            nonce: 92n,
            value: 123456789000000000000000000000n,
            guardian: "drt1x23lzn8483xs2su4fak0r0dqx6w38enpmmqf2yrkylwq7mfnvyhsmueha6",
        });
        transaction.guardianSignature = new Uint8Array(64);
        transaction.signature = new Uint8Array(
            await alice.signer.sign(Buffer.from(transactionComputer.computeBytesForSigning(transaction))),
        );

        const oldTransaction = Transaction.fromTransactionNext(transaction);

        let serializer = new ProtoSerializer();
        let buffer = serializer.serializeTransaction(oldTransaction);
        assert.equal(
            buffer.toString("hex"),
            "085c120e00018ee90ff6181f3761632000001a203ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce172a20c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24388094ebdc0340f093094a0f746573742064617461206669656c64520d6c6f63616c2d746573746e6574580262408be41d8274ae995d17b03fb0769ecd8ac571caef8772b57fb26c9f47f95ed140fa8d96818580d2557c435611cd52c9957427134f618501c7006aed459e3b7e0d6802722032a3f14cf53c4d0543954f6cf1bda0369d13e661dec095107627dc0f6d33612f7a4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        );

        const txHash = transactionComputer.computeTransactionHash(transaction);
        assert.equal(
            Buffer.from(txHash).toString("hex"),
            "f937d7007645958e016bb14eb647df3bff647dc57eb9472862be8b6d2eacfdfd",
        );
    });
});
