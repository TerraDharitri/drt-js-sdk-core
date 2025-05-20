import { assert } from "chai";
import { loadTestWallets, TestWallet } from "../testutils";
import { TokenOperationsFactory } from "./tokenOperationsFactory";
import { TokenOperationsFactoryConfig } from "./tokenOperationsFactoryConfig";

describe("test factory", () => {
    let frank: TestWallet, grace: TestWallet;
    let factory: TokenOperationsFactory;

    before(async function () {
        ({ frank, grace } = await loadTestWallets());
        factory = new TokenOperationsFactory(new TokenOperationsFactoryConfig("T"));
    });

    it("should create <issueFungible>", () => {
        const transaction = factory.issueFungible({
            issuer: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            initialSupply: 100,
            numDecimals: 0,
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canMint: true,
            canBurn: true,
            canChangeOwner: true,
            canUpgrade: true,
            canAddSpecialRoles: true,
            transactionNonce: 42
        });

        assert.equal(transaction.getData().toString(), "issue@4652414e4b@4652414e4b@64@@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e4d696e74@74727565@63616e4275726e@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@74727565@63616e4164645370656369616c526f6c6573@74727565")
        assert.equal(transaction.getNonce(), 42);
        assert.equal(transaction.getSender().toString(), frank.address.toString());
        assert.equal(transaction.getReceiver().toString(), "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2");
    });

    it("should create <issueSemiFungible>", () => {
        const transaction = factory.issueSemiFungible({
            issuer: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canTransferNFTCreateRole: true,
            canChangeOwner: true,
            canUpgrade: true,
            canAddSpecialRoles: true,
            transactionNonce: 42
        });

        assert.equal(transaction.getData().toString(), "issueSemiFungible@4652414e4b@4652414e4b@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e5472616e736665724e4654437265617465526f6c65@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@74727565@63616e4164645370656369616c526f6c6573@74727565")
        assert.equal(transaction.getNonce(), 42);
        assert.equal(transaction.getSender().toString(), frank.address.toString());
        assert.equal(transaction.getReceiver().toString(), "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2");
    });

    it("should create <issueNonFungible>", () => {
        const transaction = factory.issueNonFungible({
            issuer: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canTransferNFTCreateRole: true,
            canChangeOwner: true,
            canUpgrade: true,
            canAddSpecialRoles: true,
            transactionNonce: 42
        });

        assert.equal(transaction.getData().toString(), "issueNonFungible@4652414e4b@4652414e4b@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e5472616e736665724e4654437265617465526f6c65@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@74727565@63616e4164645370656369616c526f6c6573@74727565")
        assert.equal(transaction.getNonce(), 42);
        assert.equal(transaction.getSender().toString(), frank.address.toString());
        assert.equal(transaction.getReceiver().toString(), "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2");
    });

    it("should create <registerMetaDCDT>", () => {
        const transaction = factory.registerMetaDCDT({
            issuer: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            numDecimals: 10,
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canTransferNFTCreateRole: true,
            canChangeOwner: true,
            canUpgrade: true,
            canAddSpecialRoles: true,
            transactionNonce: 42
        });

        assert.equal(transaction.getData().toString(), "registerMetaDCDT@4652414e4b@4652414e4b@0a@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e5472616e736665724e4654437265617465526f6c65@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@74727565@63616e4164645370656369616c526f6c6573@74727565")
        assert.equal(transaction.getNonce(), 42);
        assert.equal(transaction.getSender().toString(), frank.address.toString());
        assert.equal(transaction.getReceiver().toString(), "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2");
    });

    it("should create <setSpecialRole>", () => {
        const transaction = factory.setSpecialRoleOnNonFungible({
            manager: frank.address,
            user: grace.address,
            tokenIdentifier: "FRANK-11ce3e",
            addRoleNFTCreate: true,
            addRoleNFTBurn: false,
            addRoleNFTUpdateAttributes: true,
            addRoleNFTAddURI: true,
            addRoleDCDTTransferRole: false,
            transactionNonce: 42
        });

        assert.equal(transaction.getData().toString(), "setSpecialRole@4652414e4b2d313163653365@b20d2fc05606198c671c67e83d571ec4b9e901c1a5aea53ab9d60693abc1cfe4@44434454526f6c654e4654437265617465@44434454526f6c654e465455706461746541747472696275746573@44434454526f6c654e4654416464555249");
        assert.equal(transaction.getNonce(), 42);
        assert.equal(transaction.getSender().toString(), frank.address.toString());
        assert.equal(transaction.getReceiver().toString(), "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2");
    });

    it("should create <nftCreate>", () => {
        const transaction = factory.nftCreate({
            creator: grace.address,
            tokenIdentifier: "FRANK-aa9e8d",
            initialQuantity: 1,
            name: `test`,
            royalties: 1000,
            hash: "abba",
            attributes: Buffer.from("test"),
            uris: ["a", "b"],
            transactionNonce: 42
        });

        assert.equal(transaction.getData().toString(), "DCDTNFTCreate@4652414e4b2d616139653864@01@74657374@03e8@61626261@74657374@61@62");
        assert.equal(transaction.getNonce(), 42);
        assert.equal(transaction.getSender().toString(), grace.address.toString());
        assert.equal(transaction.getReceiver().toString(), grace.address.toString());
    });
});
