import axios from "axios";
import { IApiProvider } from "./interface";
import * as errors from "./errors";
import { Logger } from "./logger";
import { NetworkStake } from "./networkStake";
import { Stats } from "./stats";
import { TransactionHash } from "./transaction";
import { TransactionOnNetwork } from "./transactionOnNetwork";
import { DCDTToken } from "./dcdtToken";
import { NFTToken } from "./nftToken";
const JSONbig = require("json-bigint");

/**
 * This is a temporary change, this will be the only provider used, ProxyProvider will be deprecated
 */
export class ApiProvider implements IApiProvider {
  private url: string;
  private timeoutLimit: number;

  /**
   * Creates a new ApiProvider.
   * @param url the URL of the Numbat Api
   * @param timeout the timeout for any request-response, in milliseconds
   */
  constructor(url: string, timeout?: number) {
    this.url = url;
    this.timeoutLimit = timeout || 1000;
  }

  /**
   * Fetches the Network Stake.
   */
  async getNetworkStake(): Promise<NetworkStake> {
    return this.doGetGeneric("stake", (response) => NetworkStake.fromHttpResponse(response));
  }

  /**
   * Fetches the Network Stats.
   */
  async getNetworkStats(): Promise<Stats> {
    return this.doGetGeneric("stats", (response) => Stats.fromHttpResponse(response));
  }

  /**
   * Fetches the state of a {@link Transaction}.
   */
  async getTransaction(txHash: TransactionHash): Promise<TransactionOnNetwork> {
    return this.doGetGeneric(`transactions/${txHash.toString()}`, (response) =>
      TransactionOnNetwork.fromHttpResponse(response)
    );
  }

  async getDCDTToken(tokenIdentifier: string): Promise<DCDTToken> {
    return this.doGetGeneric(`tokens/${tokenIdentifier}`, (response) => DCDTToken.fromHttpResponse(response));
  }

  async getNFTToken(tokenIdentifier: string): Promise<NFTToken> {
    return this.doGetGeneric(`nfts/${tokenIdentifier}`, (response) => NFTToken.fromHttpResponse(response));
  }

  /**
   * Get method that receives the resource url and on callback the method used to map the response.
   */
  async doGetGeneric(resourceUrl: string, callback: (response: any) => any): Promise<any> {
    let response = await this.doGet(resourceUrl);
    return callback(response);
  }

  private async doGet(resourceUrl: string): Promise<any> {
    try {
      let url = `${this.url}/${resourceUrl}`;
      let response = await axios.get(url, { timeout: this.timeoutLimit });

      return response.data;
    } catch (error) {
      this.handleApiError(error, resourceUrl);
    }
  }

  private handleApiError(error: any, resourceUrl: string) {
    if (!error.response) {
      Logger.warn(error);
      throw new errors.ErrApiProviderGet(resourceUrl, error.toString(), error);
    }

    let errorData = error.response.data;
    let originalErrorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
    throw new errors.ErrApiProviderGet(resourceUrl, originalErrorMessage, error);
  }
}

// See: https://github.com/axios/axios/issues/983
axios.defaults.transformResponse = [
  function(data) {
    return JSONbig.parse(data);
  },
];
