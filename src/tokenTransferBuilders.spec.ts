import { assert } from "chai";
import { Address } from "./address";
import { TokenTransfer } from "./tokenTransfer";
import { DCDTNFTTransferPayloadBuilder, DCDTTransferPayloadBuilder, MultiDCDTNFTTransferPayloadBuilder } from "./tokenTransferBuilders";

describe("test token transfer builders", () => {
    it("should work with DCDT transfers", () => {
        const transfer = TokenTransfer.fungibleFromAmount("COUNTER-8b028f", "100.00", 0);
        const payload = new DCDTTransferPayloadBuilder().setPayment(transfer).build();
        assert.equal(payload.toString(), "DCDTTransfer@434f554e5445522d386230323866@64");
    });

    it("should work with DCDTNFT transfers (NFT)", () => {
        const transfer = TokenTransfer.nonFungible("DRTJS-38f249", 1);
        const payload = new DCDTNFTTransferPayloadBuilder()
            .setPayment(transfer)
            .setDestination(new Address("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"))
            .build();

        assert.equal(payload.toString(), "DCDTNFTTransfer@4452544a532d333866323439@01@01@3ddf173c9e02c0e58fb1e552f473d98da6a4c3f23c7e034c912ee98a8dddce17");
    });

    it("should work with DCDTNFT transfers (SFT)", () => {
        const transfer = TokenTransfer.semiFungible("SEMI-9efd0f", 1, 5);

        const payload = new DCDTNFTTransferPayloadBuilder()
            .setPayment(transfer)
            .setDestination(new Address("drt1testnlersh4z0wsv8kjx39me4rmnvjkwu8dsaea7ukdvvc9z396qe2mapq"))
            .build();

        assert.equal(payload.toString(), "DCDTNFTTransfer@53454d492d396566643066@01@05@5e60b9ff2385ea27ba0c3da4689779a8f7364acee1db0ee7bee59ac660a28974");
    });

    it("should work with Multi DCDTNFT transfers", () => {
        const transferOne = TokenTransfer.nonFungible("DRTJS-38f249", 1);
        const transferTwo = TokenTransfer.fungibleFromAmount("BAR-c80d29", "10.00", 18);
        const payload = new MultiDCDTNFTTransferPayloadBuilder()
            .setPayments([transferOne, transferTwo])
            .setDestination(new Address("drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l"))
            .build();

        assert.equal(payload.toString(), "MultiDCDTNFTTransfer@c782420144e8296f757328b409d01633bf8d09d8ab11ee70d32c204f6589bd24@02@4452544a532d333866323439@01@01@4241522d633830643239@@8ac7230489e80000");
    });
});
