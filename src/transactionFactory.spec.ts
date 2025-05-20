import { assert } from "chai";
import { Address } from "./address";
import { GasEstimator } from "./gasEstimator";
import { TokenPayment } from "./tokenPayment";
import { TransactionFactory } from "./transactionFactory";
import { TransactionPayload } from "./transactionPayload";

describe("test transaction factory", () => {
    const factory = new TransactionFactory(new GasEstimator());

    it("should create REWA transfers", () => {
        const transactionWithData = factory.createREWATransfer({
            value: TokenPayment.rewaFromAmount(10.5),
            receiver: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            data: new TransactionPayload("hello"),
            chainID: "D"
        });

        assert.equal(transactionWithData.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transactionWithData.getValue(), "10500000000000000000");
        assert.equal(transactionWithData.getGasLimit(), 50000 + 5 * 1500);
        assert.equal(transactionWithData.getData().toString(), "hello");
        assert.equal(transactionWithData.getChainID(), "D");

        const transactionWithoutData = factory.createREWATransfer({
            value: TokenPayment.rewaFromAmount(10.5),
            receiver: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transactionWithoutData.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transactionWithoutData.getValue(), "10500000000000000000");
        assert.equal(transactionWithoutData.getGasLimit(), 50000);
        assert.equal(transactionWithoutData.getData().toString(), "");
        assert.equal(transactionWithoutData.getChainID(), "D");
    });

    it("should create DCDT transfers", () => {
        const transaction = factory.createDCDTTransfer({
            payment: TokenPayment.fungibleFromAmount("COUNTER-8b028f", "100.00", 0),
            receiver: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transaction.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getValue(), "");
        assert.equal(transaction.getGasLimit(), 50000 + 44 * 1500 + 200000 + 100000);
        assert.equal(transaction.getData().toString(), "DCDTTransfer@434f554e5445522d386230323866@64");
        assert.equal(transaction.getChainID(), "D");
    });

    it("should create DCDTNFT transfers", () => {
        const transaction = factory.createDCDTNFTTransfer({
            payment: TokenPayment.nonFungible("DRTJS-38f249", 1),
            destination: new Address("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"),
            sender: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transaction.getSender().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getValue(), "");
        assert.equal(transaction.getGasLimit(), 50000 + 111 * 1500 + 200000 + 800000);
        assert.equal(transaction.getData().toString(), "DCDTNFTTransfer@4452544a532d333866323439@01@01@3ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce17");
        assert.equal(transaction.getChainID(), "D");
    });

    it("should create Multi DCDTNFT transfers", () => {
        const transaction = factory.createMultiDCDTNFTTransfer({
            payments: [
                TokenPayment.nonFungible("DRTJS-38f249", 1),
                TokenPayment.fungibleFromAmount("BAR-c80d29", "10.00", 18)
            ],
            destination: new Address("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"),
            sender: new Address("drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k"),
            chainID: "D"
        });

        assert.equal(transaction.getSender().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getReceiver().bech32(), "drt1n2nkf0sfmst3z38p0sklz0xntprkr9hjr7rttewj3l9uhu629fpsfazg6k");
        assert.equal(transaction.getValue(), "");
        assert.equal(transaction.getGasLimit(), 50000 + 158 * 1500 + (200000 + 800000) * 2);
        assert.equal(transaction.getData().toString(), "MultiDCDTNFTTransfer@c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24@02@4452544a532d333866323439@01@01@4241522d633830643239@@8ac7230489e80000");
        assert.equal(transaction.getChainID(), "D");
    });
});
