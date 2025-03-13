import {ScArgumentsParser} from "./scArgumentsParser";
import {ErrInvalidDcdtTransferDataField} from "./errors";
import BigNumber from "bignumber.js";
import {DCDT_TRANSFER_FUNCTION_NAME, DCDT_TRANSFER_GAS_LIMIT, DCDT_TRANSFER_VALUE} from "./constants";

/**
 * This class exposes static methods that are useful for parsing DCDT transfer transactions
 */
export class DcdtHelpers {

    /**
     * This function will return the token identifier and the amount from a given data field for an DCDT transfer, or
     * an exception if something went wrong
     * @param dataField this field represents the data filed to extract dcdt transfer data from
     * @throws ErrInvalidDcdtTransferDataField this function throws an ErrInvalidDcdtTransferDataField if the provided data field isn't meant to be an DCDT transfer
     * @return {tokenIdentifier, amount} this function returns a pair of token identifier and amount to transfer
     */
    public static extractFieldsFromDcdtTransferDataField(dataField: string): { tokenIdentifier: string, amount: string } {
        if (!dataField.startsWith(DCDT_TRANSFER_FUNCTION_NAME + "@")) {
            throw new ErrInvalidDcdtTransferDataField();
        }

        let {args} = ScArgumentsParser.parseSmartContractCallDataField(dataField);

        if (args.length != 2) {
            throw new ErrInvalidDcdtTransferDataField();
        }

        let tokenIdentifier = args[0];
        let amount = new BigNumber(args[1], 16).toString(10);

        return {
            tokenIdentifier: tokenIdentifier,
            amount: amount
        };
    }

    /**
     * This function checks if the data field represents a valid DCDT transfer call
     * @param dataField this field represents the string to be checked if it would trigger an DCDT transfer call
     * @return true if the provided data field is meant to be an DCDT transfer
     */
    public static isDcdtTransferTransaction(dataField: string): Boolean {
        if (!dataField.startsWith(DCDT_TRANSFER_FUNCTION_NAME + "@")) {
            return false;
        }

        let args: string[];
        try {
            args = ScArgumentsParser.parseSmartContractCallDataField(dataField).args;
        } catch (e) {
            return false;
        }

        return args.length === 2;
    }

    /**
     * getTxFieldsForDcdtTransfer returns the needed value, gasLimit and data field (in string format) for sending an amount of DCDT token
     * @param tokenIdentifier this field represents the identifier of the token to transfer
     * @param amount this field represents the denominated amount of the token to send
     * @return {value, gasLimit, data} this function returns the value, the gas limit and the data field to use
     */
    public static getTxFieldsForDcdtTransfer(tokenIdentifier: string, amount: string): { value: string, gasLimit: number, data: string } {
        const encodedAmount = new BigNumber(amount, 10).toString(16);
        const txDataField = [DCDT_TRANSFER_FUNCTION_NAME, tokenIdentifier, encodedAmount].join("@");

        return {
            value: DCDT_TRANSFER_VALUE,
            gasLimit: DCDT_TRANSFER_GAS_LIMIT,
            data: txDataField
        };
    }
}
