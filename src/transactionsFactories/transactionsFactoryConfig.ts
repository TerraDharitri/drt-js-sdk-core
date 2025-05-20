import { DEFAULT_HRP } from "../constants";

export class TransactionsFactoryConfig {
    chainID: string;
    addressHrp: string;
    minGasLimit: bigint;
    gasLimitPerByte: bigint;
    gasLimitIssue: bigint;
    gasLimitToggleBurnRoleGlobally: bigint;
    gasLimitDcdtLocalMint: bigint;
    gasLimitDcdtLocalBurn: bigint;
    gasLimitSetSpecialRole: bigint;
    gasLimitPausing: bigint;
    gasLimitFreezing: bigint;
    gasLimitWiping: bigint;
    gasLimitDcdtNftCreate: bigint;
    gasLimitDcdtNftUpdateAttributes: bigint;
    gasLimitDcdtNftAddQuantity: bigint;
    gasLimitDcdtNftBurn: bigint;
    gasLimitStorePerByte: bigint;
    issueCost: bigint;
    gasLimitStake: bigint;
    gasLimitUnstake: bigint;
    gasLimitUnbond: bigint;
    gasLimitCreateDelegationContract: bigint;
    gasLimitDelegationOperations: bigint;
    additionalGasLimitPerValidatorNode: bigint;
    additionalGasLimitForDelegationOperations: bigint;
    gasLimitDCDTTransfer: bigint;
    gasLimitDCDTNFTTransfer: bigint;
    gasLimitMultiDCDTNFTTransfer: bigint;

    constructor(options: { chainID: string }) {
        // General-purpose configuration
        this.chainID = options.chainID;
        this.addressHrp = DEFAULT_HRP;
        this.minGasLimit = 50000n;
        this.gasLimitPerByte = 1500n;

        // Configuration for token operations
        this.gasLimitIssue = 60000000n;
        this.gasLimitToggleBurnRoleGlobally = 60000000n;
        this.gasLimitDcdtLocalMint = 300000n;
        this.gasLimitDcdtLocalBurn = 300000n;
        this.gasLimitSetSpecialRole = 60000000n;
        this.gasLimitPausing = 60000000n;
        this.gasLimitFreezing = 60000000n;
        this.gasLimitWiping = 60000000n;
        this.gasLimitDcdtNftCreate = 3000000n;
        this.gasLimitDcdtNftUpdateAttributes = 1000000n;
        this.gasLimitDcdtNftAddQuantity = 1000000n;
        this.gasLimitDcdtNftBurn = 1000000n;
        this.gasLimitStorePerByte = 50000n;
        this.issueCost = 50000000000000000n;

        // Configuration for delegation operations
        this.gasLimitStake = 5000000n;
        this.gasLimitUnstake = 5000000n;
        this.gasLimitUnbond = 5000000n;
        this.gasLimitCreateDelegationContract = 50000000n;
        this.gasLimitDelegationOperations = 1000000n;
        this.additionalGasLimitPerValidatorNode = 6000000n;
        this.additionalGasLimitForDelegationOperations = 10000000n;

        // Configuration for token transfers
        this.gasLimitDCDTTransfer = 200000n;
        this.gasLimitDCDTNFTTransfer = 200000n;
        this.gasLimitMultiDCDTNFTTransfer = 200000n;
    }
}
