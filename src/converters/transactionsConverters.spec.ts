import { assert } from "chai";
import { Address } from "../address";
import {
    ContractResultItem,
    ContractResults,
    TransactionEventData,
    TransactionEventOnNetwork,
    TransactionEventTopic,
    TransactionLogsOnNetwork,
    TransactionOnNetwork,
} from "../networkProviders";
import { Transaction } from "../transaction";
import {
    SmartContractCallOutcome,
    SmartContractResult,
    TransactionEvent,
    TransactionLogs,
    TransactionOutcome,
} from "../transactionsOutcomeParsers/resources";
import { TransactionsConverter } from "./transactionsConverter";

describe("test transactions converter", async () => {
    it("converts transaction to plain object and back", () => {
        const converter = new TransactionsConverter();

        const transaction = new Transaction({
            nonce: 90,
            value: BigInt("123456789000000000000000000000"),
            sender: "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
            receiver: "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2",
            senderUsername: "alice",
            receiverUsername: "bob",
            gasPrice: 1000000000,
            gasLimit: 80000,
            data: Buffer.from("hello"),
            chainID: "localnet",
            version: 2,
        });

        const plainObject = converter.transactionToPlainObject(transaction);
        const restoredTransaction = converter.plainObjectToTransaction(plainObject);

        assert.deepEqual(plainObject, transaction.toPlainObject());
        assert.deepEqual(restoredTransaction, Transaction.fromPlainObject(plainObject));
        assert.deepEqual(restoredTransaction, transaction);
        assert.deepEqual(plainObject, {
            nonce: 90,
            value: "123456789000000000000000000000",
            sender: "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
            receiver: "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2",
            senderUsername: "YWxpY2U=",
            receiverUsername: "Ym9i",
            gasPrice: 1000000000,
            gasLimit: 80000,
            data: "aGVsbG8=",
            chainID: "localnet",
            version: 2,
            options: undefined,
            guardian: undefined,
            signature: undefined,
            relayer: undefined,
            guardianSignature: undefined,
            relayerSignature: undefined,
        });
    });

    it("converts transaction on network to transaction outcome", () => {
        const converter = new TransactionsConverter();

        const transactionOnNetwork = new TransactionOnNetwork({
            nonce: 7,
            function: "hello",
            logs: new TransactionLogsOnNetwork({
                address: Address.fromBech32("drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q"),
                events: [
                    new TransactionEventOnNetwork({
                        identifier: "foobar",
                        topics: [],
                        dataPayload: new TransactionEventData(Buffer.from("foo")),
                        additionalData: [],
                    }),
                ],
            }),
            contractResults: new ContractResults([
                new ContractResultItem({
                    nonce: 8,
                    data: "@6f6b@2a",
                    logs: new TransactionLogsOnNetwork({
                        address: Address.fromBech32("drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q"),
                        events: [
                            new TransactionEventOnNetwork({
                                identifier: "writeLog",
                                topics: [
                                    new TransactionEventTopic(
                                        // '@too much gas provided for processing: gas provided = 596384500, gas used = 733010'
                                        "QHRvbyBtdWNoIGdhcyBwcm92aWRlZCBmb3IgcHJvY2Vzc2luZzogZ2FzIHByb3ZpZGVkID0gNTk2Mzg0NTAwLCBnYXMgdXNlZCA9IDczMzAxMA==",
                                    ),
                                ],
                                dataPayload: TransactionEventData.fromBase64("QDZmNmI="),
                            }),
                        ],
                    }),
                }),
            ]),
        });

        const actualTransactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetwork);
        const expectedTransactionOutcome = new TransactionOutcome({
            directSmartContractCallOutcome: new SmartContractCallOutcome({
                function: "hello",
                returnCode: "ok",
                returnMessage: "ok",
                returnDataParts: [Buffer.from([42])],
            }),
            smartContractResults: [
                new SmartContractResult({
                    sender: "",
                    receiver: "",
                    data: Buffer.from("@6f6b@2a"),
                    logs: {
                        address: "drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q",
                        events: [
                            new TransactionEvent({
                                address: "",
                                identifier: "writeLog",
                                topics: [
                                    Buffer.from(
                                        "@too much gas provided for processing: gas provided = 596384500, gas used = 733010",
                                    ),
                                ],
                                dataItems: [Buffer.from("QDZmNmI=", "base64")],
                            }),
                        ],
                    },
                }),
            ],
            logs: new TransactionLogs({
                address: "drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q",
                events: [
                    new TransactionEvent({
                        address: "",
                        identifier: "foobar",
                        topics: [],
                        dataItems: [Buffer.from("foo")],
                    }),
                ],
            }),
        });

        assert.deepEqual(actualTransactionOutcome, expectedTransactionOutcome);
    });

    it("converts transaction on network to transaction outcome (with signal error)", () => {
        const converter = new TransactionsConverter();

        const transactionOnNetwork = new TransactionOnNetwork({
            nonce: 42,
            function: "hello",
            contractResults: new ContractResults([
                new ContractResultItem({
                    nonce: 42,
                    data: "@657865637574696f6e206661696c6564",
                    logs: new TransactionLogsOnNetwork({
                        address: Address.fromBech32("drt1qqqqqqqqqqqqqpgqj8k976l59n7fyth8ujl4as5uyn3twn0ha0ws49rqhc"),
                        events: [
                            new TransactionEventOnNetwork({
                                address: Address.fromBech32(
                                    "drt1qqqqqqqqqqqqqpgqj8k976l59n7fyth8ujl4as5uyn3twn0ha0ws49rqhc",
                                ),
                                identifier: "signalError",
                                topics: [
                                    new TransactionEventTopic("XmC5/yOF6ie6DD2kaJd5qPc2Ss7h2w7nvuWaxmCiiXQ="),
                                    new TransactionEventTopic("aW5zdWZmaWNpZW50IGZ1bmRz"),
                                ],
                                dataPayload: new TransactionEventData(Buffer.from("@657865637574696f6e206661696c6564")),
                                additionalData: [
                                    new TransactionEventData(Buffer.from("@657865637574696f6e206661696c6564")),
                                    new TransactionEventData(Buffer.from("foobar")),
                                ],
                            }),
                        ],
                    }),
                }),
            ]),
        });

        const actualTransactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetwork);
        const expectedTransactionOutcome = new TransactionOutcome({
            directSmartContractCallOutcome: new SmartContractCallOutcome({
                function: "hello",
                returnCode: "execution failed",
                returnMessage: "execution failed",
                returnDataParts: [],
            }),
            smartContractResults: [
                new SmartContractResult({
                    sender: "",
                    receiver: "",
                    data: Buffer.from("@657865637574696f6e206661696c6564"),
                    logs: {
                        address: "drt1qqqqqqqqqqqqqpgqj8k976l59n7fyth8ujl4as5uyn3twn0ha0ws49rqhc",
                        events: [
                            new TransactionEvent({
                                address: "drt1qqqqqqqqqqqqqpgqj8k976l59n7fyth8ujl4as5uyn3twn0ha0ws49rqhc",
                                identifier: "signalError",
                                topics: [
                                    Address.fromBech32(
                                        "drt1testnlersh4z0wsv8kjx39me4rmnvjkwu8dsaea7ukdvvc9z396qe2mapq",
                                    ).getPublicKey(),
                                    Buffer.from("insufficient funds"),
                                ],
                                dataItems: [Buffer.from("@657865637574696f6e206661696c6564"), Buffer.from("foobar")],
                            }),
                        ],
                    },
                }),
            ],
        });

        assert.deepEqual(actualTransactionOutcome, expectedTransactionOutcome);
    });
});
