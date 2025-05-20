import { IAddress } from "../interface";
import { NextTokenTransfer, TokenComputer } from "../tokens";
import { addressToHex, numberToPaddedHex, utf8ToHex } from "../utils.codec";

export class TokenTransfersDataBuilder {
    private tokenComputer: TokenComputer;

    constructor() {
        this.tokenComputer = new TokenComputer();
    }

    buildArgsForDCDTTransfer(transfer: NextTokenTransfer): string[] {
        let args = ["DCDTTransfer"];
        args.push(...[utf8ToHex(transfer.token.identifier), numberToPaddedHex(transfer.amount)]);
        return args;
    }

    buildArgsForSingleDCDTNFTTransfer(transfer: NextTokenTransfer, receiver: IAddress) {
        let args = ["DCDTNFTTransfer"];

        const token = transfer.token;
        const identifier = this.tokenComputer.extractIdentifierFromExtendedIdentifier(token.identifier);

        args.push(
            ...[
                utf8ToHex(identifier),
                numberToPaddedHex(token.nonce),
                numberToPaddedHex(transfer.amount),
                addressToHex(receiver),
            ],
        );
        return args;
    }

    buildArgsForMultiDCDTNFTTransfer(receiver: IAddress, transfers: NextTokenTransfer[]) {
        let args = ["MultiDCDTNFTTransfer", addressToHex(receiver), numberToPaddedHex(transfers.length)];

        for (let transfer of transfers) {
            const identifier = this.tokenComputer.extractIdentifierFromExtendedIdentifier(transfer.token.identifier);
            args.push(
                ...[utf8ToHex(identifier), numberToPaddedHex(transfer.token.nonce), numberToPaddedHex(transfer.amount)],
            );
        }

        return args;
    }
}
