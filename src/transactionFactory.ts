import { Address } from "./address";
import { IAddress, IChainID, IGasLimit, IGasPrice, INonce, ITokenPayment, ITransactionPayload, ITransactionValue } from "./interface";
import { DCDTNFTTransferPayloadBuilder, DCDTTransferPayloadBuilder, MultiDCDTNFTTransferPayloadBuilder } from "./tokenTransferBuilders";
import { Transaction } from "./transaction";

interface IGasEstimator {
    forREWATransfer(dataLength: number): number;
    forDCDTTransfer(dataLength: number): number;
    forDCDTNFTTransfer(dataLength: number): number;
    forMultiDCDTNFTTransfer(dataLength: number, numTransfers: number): number;
}

/**
 * @deprecated Use {@link TransfersFactory} instead (same interface, different name).
 */
export class TransactionFactory {
    private readonly gasEstimator;

    constructor(gasEstimator: IGasEstimator) {
        this.gasEstimator = gasEstimator;
    }

    createREWATransfer(args: {
        nonce?: INonce;
        value: ITransactionValue;
        receiver: IAddress;
        sender?: IAddress;
        gasPrice?: IGasPrice;
        gasLimit?: IGasLimit;
        data?: ITransactionPayload;
        chainID: IChainID;
    }) {
        const dataLength = args.data?.length() || 0;
        const estimatedGasLimit = this.gasEstimator.forREWATransfer(dataLength);

        return new Transaction({
            nonce: args.nonce,
            value: args.value,
            receiver: args.receiver,
            sender: args.sender || Address.Zero(),
            gasPrice: args.gasPrice,
            gasLimit: args.gasLimit || estimatedGasLimit,
            data: args.data,
            chainID: args.chainID
        });
    }

    createDCDTTransfer(args: {
        payment: ITokenPayment,
        nonce?: INonce;
        receiver: IAddress;
        sender?: IAddress;
        gasPrice?: IGasPrice;
        gasLimit?: IGasLimit;
        chainID: IChainID;
    }) {
        const transactionPayload = new DCDTTransferPayloadBuilder()
            .setPayment(args.payment)
            .build();

        const dataLength = transactionPayload.length() || 0;
        const estimatedGasLimit = this.gasEstimator.forDCDTTransfer(dataLength);

        return new Transaction({
            nonce: args.nonce,
            receiver: args.receiver,
            sender: args.sender || Address.Zero(),
            gasPrice: args.gasPrice,
            gasLimit: args.gasLimit || estimatedGasLimit,
            data: transactionPayload,
            chainID: args.chainID
        });
    }

    createDCDTNFTTransfer(args: {
        payment: ITokenPayment,
        nonce?: INonce;
        destination: IAddress;
        sender: IAddress;
        gasPrice?: IGasPrice;
        gasLimit?: IGasLimit;
        chainID: IChainID;
    }) {
        const transactionPayload = new DCDTNFTTransferPayloadBuilder()
            .setPayment(args.payment)
            .setDestination(args.destination)
            .build();

        const dataLength = transactionPayload.length() || 0;
        const estimatedGasLimit = this.gasEstimator.forDCDTNFTTransfer(dataLength);

        return new Transaction({
            nonce: args.nonce,
            receiver: args.sender,
            sender: args.sender,
            gasPrice: args.gasPrice,
            gasLimit: args.gasLimit || estimatedGasLimit,
            data: transactionPayload,
            chainID: args.chainID
        });
    }

    createMultiDCDTNFTTransfer(args: {
        payments: ITokenPayment[],
        nonce?: INonce;
        destination: IAddress;
        sender: IAddress;
        gasPrice?: IGasPrice;
        gasLimit?: IGasLimit;
        chainID: IChainID;
    }) {
        const transactionPayload = new MultiDCDTNFTTransferPayloadBuilder()
            .setPayments(args.payments)
            .setDestination(args.destination)
            .build();

        const dataLength = transactionPayload.length() || 0;
        const estimatedGasLimit = this.gasEstimator.forMultiDCDTNFTTransfer(dataLength, args.payments.length);

        return new Transaction({
            nonce: args.nonce,
            receiver: args.sender,
            sender: args.sender,
            gasPrice: args.gasPrice,
            gasLimit: args.gasLimit || estimatedGasLimit,
            data: transactionPayload,
            chainID: args.chainID
        });
    }
}
