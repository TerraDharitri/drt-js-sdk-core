import { Transaction } from "../transaction";

export interface IDappProvider {
    init(): Promise<boolean>;
    login(options?: {callbackUrl?: string}): Promise<string>;
    logout(): Promise<boolean>;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    isConnected(): Promise<boolean>;
    sendTransaction(transaction: Transaction, options?: {callbackUrl?: string}): Promise<Transaction>;
}

export interface IHWProvider extends IDappProvider {
    getAccounts(startIndex: number, length: number): Promise<string[]>;
}

export interface IDappMessageEvent extends MessageEvent {
    data: {
        type: string;
        data: any;
        error: string;
    };
}

export interface IHWNumbatApp {
    getAddress(
        account: number,
        index: number,
        display?: boolean
    ): Promise<{
        publicKey: string;
        address: string;
        chainCode?: string;
    }>;
    signTransaction(rawTx: Buffer, usingHash: boolean): Promise<string>;
    getAppConfiguration(): Promise<{
        version: string;
        contractData: number;
        accountIndex: number;
        addressIndex: number;
    }>;
}
