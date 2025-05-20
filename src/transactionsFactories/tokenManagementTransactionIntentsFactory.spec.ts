import { assert } from "chai";
import { DCDT_CONTRACT_ADDRESS } from "../constants";
import { loadTestWallets, TestWallet } from "../testutils";
import { TokenManagementTransactionsFactory } from "./tokenManagementTransactionsFactory";
import { TransactionsFactoryConfig } from "./transactionsFactoryConfig";

describe("test token management transactions factory", () => {
    let frank: TestWallet, grace: TestWallet;
    let tokenManagementFactory: TokenManagementTransactionsFactory;
    let config: TransactionsFactoryConfig;

    before(async function () {
        ({ frank, grace } = await loadTestWallets());
        config = new TransactionsFactoryConfig({ chainID: "T" });
        tokenManagementFactory = new TokenManagementTransactionsFactory(config);
    });

    it("should create 'TransactionNext' for registering and setting roles", () => {
        const transaction = tokenManagementFactory.createTransactionForRegisteringAndSettingRoles({
            sender: frank.address,
            tokenName: "TEST",
            tokenTicker: "TEST",
            tokenType: "FNG",
            numDecimals: 2n,
        });

        assert.deepEqual(transaction.data, Buffer.from("registerAndSetAllRoles@54455354@54455354@464e47@02"));
        assert.equal(transaction.sender, frank.address.toString());
        assert.equal(transaction.receiver, "drt1yvesqqqqqqqqqqqqqqqqqqqqqqqqyvesqqqqqqqqqqqqqqqzlllsd5j0s2");
        assert.deepEqual(transaction.value, config.issueCost);
        assert.deepEqual(transaction.gasLimit, 60125000n);
    });

    it("should create 'TransactionNext' for issuing fungible token", () => {
        const next = tokenManagementFactory.createTransactionForIssuingFungible({
            sender: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            initialSupply: 100n,
            numDecimals: 0n,
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canChangeOwner: true,
            canUpgrade: false,
            canAddSpecialRoles: false,
        });

        assert.deepEqual(
            next.data,
            Buffer.from(
                "issue@4652414e4b@4652414e4b@64@00@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@66616c7365@63616e4164645370656369616c526f6c6573@66616c7365",
            ),
        );
        assert.equal(next.sender, frank.address.toString());
        assert.equal(next.receiver, DCDT_CONTRACT_ADDRESS);
        assert.deepEqual(next.value, config.issueCost);
    });

    it("should create 'TransactionNext' for issuing semi-fungible token", () => {
        const transaction = tokenManagementFactory.createTransactionForIssuingSemiFungible({
            sender: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canTransferNFTCreateRole: true,
            canChangeOwner: true,
            canUpgrade: false,
            canAddSpecialRoles: false,
        });

        assert.deepEqual(
            transaction.data,
            Buffer.from(
                "issueSemiFungible@4652414e4b@4652414e4b@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e5472616e736665724e4654437265617465526f6c65@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@66616c7365@63616e4164645370656369616c526f6c6573@66616c7365",
            ),
        );
        assert.equal(transaction.sender, frank.address.toString());
        assert.equal(transaction.receiver, DCDT_CONTRACT_ADDRESS);
        assert.deepEqual(transaction.value, config.issueCost);
    });

    it("should create 'TransactionNext' for issuing non-fungible token", () => {
        const transaction = tokenManagementFactory.createTransactionForIssuingNonFungible({
            sender: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canTransferNFTCreateRole: true,
            canChangeOwner: true,
            canUpgrade: false,
            canAddSpecialRoles: false,
        });

        assert.deepEqual(
            transaction.data,
            Buffer.from(
                "issueNonFungible@4652414e4b@4652414e4b@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e5472616e736665724e4654437265617465526f6c65@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@66616c7365@63616e4164645370656369616c526f6c6573@66616c7365",
            ),
        );
        assert.equal(transaction.sender, frank.address.toString());
        assert.equal(transaction.receiver, DCDT_CONTRACT_ADDRESS);
        assert.deepEqual(transaction.value, config.issueCost);
    });

    it("should create 'TransactionNext' for registering metaDcdt", () => {
        const transaction = tokenManagementFactory.createTransactionForRegisteringMetaDCDT({
            sender: frank.address,
            tokenName: "FRANK",
            tokenTicker: "FRANK",
            numDecimals: 10n,
            canFreeze: true,
            canWipe: true,
            canPause: true,
            canTransferNFTCreateRole: true,
            canChangeOwner: true,
            canUpgrade: false,
            canAddSpecialRoles: false,
        });

        assert.deepEqual(
            transaction.data,
            Buffer.from(
                "registerMetaDCDT@4652414e4b@4652414e4b@0a@63616e467265657a65@74727565@63616e57697065@74727565@63616e5061757365@74727565@63616e5472616e736665724e4654437265617465526f6c65@74727565@63616e4368616e67654f776e6572@74727565@63616e55706772616465@66616c7365@63616e4164645370656369616c526f6c6573@66616c7365",
            ),
        );
        assert.equal(transaction.sender, frank.address.toString());
        assert.equal(transaction.receiver, DCDT_CONTRACT_ADDRESS);
        assert.deepEqual(transaction.value, config.issueCost);
    });

    it("should create 'TransactionNext' for setting spcial role on non-fungible token", () => {
        const transaction = tokenManagementFactory.createTransactionForSettingSpecialRoleOnNonFungibleToken({
            sender: frank.address,
            user: grace.address,
            tokenIdentifier: "FRANK-11ce3e",
            addRoleNFTCreate: true,
            addRoleNFTBurn: false,
            addRoleNFTUpdateAttributes: true,
            addRoleNFTAddURI: true,
            addRoleDCDTTransferRole: false,
        });

        assert.deepEqual(
            transaction.data,
            Buffer.from(
                "setSpecialRole@4652414e4b2d313163653365@b20d2fc05606198c671c67e83d571ec4b9e901c1a5aea53ab9d60693abc1cfe4@44434454526f6c654e4654437265617465@44434454526f6c654e465455706461746541747472696275746573@44434454526f6c654e4654416464555249",
            ),
        );
        assert.equal(transaction.sender, frank.address.toString());
        assert.equal(transaction.receiver, DCDT_CONTRACT_ADDRESS);
        assert.equal(transaction.value, 0n);
    });

    it("should create 'TransactionNext' for creating nft", () => {
        const transaction = tokenManagementFactory.createTransactionForCreatingNFT({
            sender: grace.address,
            tokenIdentifier: "FRANK-aa9e8d",
            initialQuantity: 1n,
            name: "test",
            royalties: 1000,
            hash: "abba",
            attributes: Buffer.from("test"),
            uris: ["a", "b"],
        });

        assert.deepEqual(
            transaction.data,
            Buffer.from("DCDTNFTCreate@4652414e4b2d616139653864@01@74657374@03e8@61626261@74657374@61@62"),
        );
        assert.equal(transaction.sender, grace.address.toString());
        assert.equal(transaction.receiver, grace.address.toString());
        assert.equal(transaction.value, 0n);
    });
});
