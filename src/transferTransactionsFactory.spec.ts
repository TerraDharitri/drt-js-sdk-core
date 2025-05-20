import { assert } from "chai";
import { Address } from "./address";
import { GasEstimator } from "./gasEstimator";
import { TokenTransfer } from "./tokens";
import { TransactionPayload } from "./transactionPayload";
import { TransferTransactionsFactory } from "./transactionsFactories/transferTransactionsFactory";

describe("test transaction factory", () => {
    const factory = new TransferTransactionsFactory(new GasEstimator());

    it("should create REWA transfers", () => {
        const transactionWithData = factory.createREWATransfer({
            value: TokenTransfer.rewaFromAmount(10.5),
            sender: Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            receiver: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            data: new TransactionPayload("hello"),
            chainID: "D"
        });

        assert.equal(transactionWithData.getSender().bech32(), "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(transactionWithData.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transactionWithData.getValue(), "10500000000000000000");
        assert.equal(transactionWithData.getGasLimit(), 50000 + 5 * 1500);
        assert.equal(transactionWithData.getData().toString(), "hello");
        assert.equal(transactionWithData.getChainID(), "D");

        const transactionWithoutData = factory.createREWATransfer({
            value: TokenTransfer.rewaFromAmount(10.5),
            sender: Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            receiver: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transactionWithoutData.getSender().bech32(), "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(transactionWithoutData.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transactionWithoutData.getValue(), "10500000000000000000");
        assert.equal(transactionWithoutData.getGasLimit(), 50000);
        assert.equal(transactionWithoutData.getData().toString(), "");
        assert.equal(transactionWithoutData.getChainID(), "D");
    });

    it("should create DCDT transfers", () => {
        const transaction = factory.createDCDTTransfer({
            tokenTransfer: TokenTransfer.fungibleFromAmount("TEST-8b028f", "100.00", 2),
            sender: Address.fromBech32("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            receiver: Address.fromBech32("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transaction.getSender().bech32(), "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l");
        assert.equal(transaction.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getValue(), "");
        assert.equal(transaction.getGasLimit(), 50000 + 40 * 1500 + 200000 + 100000);
        assert.equal(transaction.getData().toString(), "DCDTTransfer@544553542d386230323866@2710");
        assert.equal(transaction.getChainID(), "D");
    });

    it("should create DCDTNFT transfers", () => {
        const transaction = factory.createDCDTNFTTransfer({
            tokenTransfer: TokenTransfer.nonFungible("TEST-38f249", 1),
            destination: new Address("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"),
            sender: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transaction.getSender().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getValue(), "");
        assert.equal(transaction.getGasLimit(), 50000 + 109 * 1500 + 200000 + 800000);
        assert.equal(transaction.getData().toString(), "DCDTNFTTransfer@544553542d333866323439@01@01@3ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce17");
        assert.equal(transaction.getChainID(), "D");
    });

    it("should create Multi DCDTNFT transfers", () => {
        const transaction = factory.createMultiDCDTNFTTransfer({
            tokenTransfers: [
                TokenTransfer.nonFungible("FOO-38f249", 1),
                TokenTransfer.fungibleFromAmount("BAR-c80d29", "10.00", 18)
            ],
            destination: new Address("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            sender: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transaction.getSender().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getValue(), "");
        assert.equal(transaction.getGasLimit(), 50000 + 154 * 1500 + (200000 + 800000) * 2);
        assert.equal(transaction.getData().toString(), "MultiDCDTNFTTransfer@c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24@02@464f4f2d333866323439@01@01@4241522d633830643239@@8ac7230489e80000");
        assert.equal(transaction.getChainID(), "D");
    });
});
