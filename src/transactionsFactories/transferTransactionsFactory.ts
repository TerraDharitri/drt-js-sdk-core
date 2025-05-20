import { TokenTransfersDataBuilder } from "./tokenTransfersDataBuilder";
import { IAddress } from "../interface";
import { NextTokenTransfer, Token } from "../tokens";
import { ErrBadUsage } from "../errors";
import { TransactionNextBuilder } from "./transactionNextBuilder";
import { TransactionNext } from "../transaction";

const ADDITIONAL_GAS_FOR_DCDT_TRANSFER = 100000;
const ADDITIONAL_GAS_FOR_DCDT_NFT_TRANSFER = 800000;

interface IConfig {
    chainID: string;
    minGasLimit: bigint;
    gasLimitPerByte: bigint;
    gasLimitDCDTTransfer: bigint;
    gasLimitDCDTNFTTransfer: bigint;
    gasLimitMultiDCDTNFTTransfer: bigint;
}

interface TokenComputer {
    isFungible(token: Token): boolean;
}

/**
 * Use this class to create transactions for native token transfers (REWA) or custom tokens transfers (DCDT/NTF/MetaDCDT).
 * This name is only temporary, the class will be renamed to `TransferTransactionsFactory`.
 */
export class NextTransferTransactionsFactory {
    private readonly config: IConfig;
    private readonly dataArgsBuilder: TokenTransfersDataBuilder;
    private readonly tokenComputer: TokenComputer;

    constructor(config: IConfig, tokenComputer: TokenComputer) {
        this.config = config;
        this.tokenComputer = tokenComputer;
        this.dataArgsBuilder = new TokenTransfersDataBuilder();
    }

    createTransactionForNativeTokenTransfer(options: {
        sender: IAddress;
        receiver: IAddress;
        nativeAmount: bigint;
        data?: string;
    }): TransactionNext {
        const data = options.data || "";

        return new TransactionNextBuilder({
            config: this.config,
            sender: options.sender,
            receiver: options.receiver,
            dataParts: [data],
            gasLimit: 0n,
            addDataMovementGas: true,
            amount: options.nativeAmount,
        }).build();
    }

    createTransactionForDCDTTokenTransfer(options: {
        sender: IAddress;
        receiver: IAddress;
        tokenTransfers: NextTokenTransfer[];
    }): TransactionNext {
        const numberOfTransfers = options.tokenTransfers.length;

        if (numberOfTransfers === 0) {
            throw new ErrBadUsage("No token transfer has been provided");
        }

        if (numberOfTransfers === 1) {
            return this.createSingleDCDTTransferDraft(options);
        }

        const transferArgs = this.dataArgsBuilder.buildArgsForMultiDCDTNFTTransfer(
            options.receiver,
            options.tokenTransfers,
        );

        const extraGasForTransfer =
            this.config.gasLimitMultiDCDTNFTTransfer * BigInt(numberOfTransfers) +
            BigInt(ADDITIONAL_GAS_FOR_DCDT_NFT_TRANSFER);

        return new TransactionNextBuilder({
            config: this.config,
            sender: options.sender,
            receiver: options.sender,
            dataParts: transferArgs,
            gasLimit: extraGasForTransfer,
            addDataMovementGas: true,
        }).build();
    }

    private createSingleDCDTTransferDraft(options: {
        sender: IAddress;
        receiver: IAddress;
        tokenTransfers: NextTokenTransfer[];
    }): TransactionNext {
        let transferArgs: string[] = [];
        const transfer = options.tokenTransfers[0];
        let extraGasForTransfer = 0n;
        let receiver = options.receiver;

        if (this.tokenComputer.isFungible(transfer.token)) {
            transferArgs = this.dataArgsBuilder.buildArgsForDCDTTransfer(transfer);
            extraGasForTransfer = this.config.gasLimitDCDTTransfer + BigInt(ADDITIONAL_GAS_FOR_DCDT_TRANSFER);
        } else {
            transferArgs = this.dataArgsBuilder.buildArgsForSingleDCDTNFTTransfer(transfer, receiver);
            extraGasForTransfer = this.config.gasLimitDCDTNFTTransfer + BigInt(ADDITIONAL_GAS_FOR_DCDT_NFT_TRANSFER);
            receiver = options.sender;
        }

        return new TransactionNextBuilder({
            config: this.config,
            sender: options.sender,
            receiver: receiver,
            dataParts: transferArgs,
            gasLimit: extraGasForTransfer,
            addDataMovementGas: true,
        }).build();
    }
}
