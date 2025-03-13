import { assert } from "chai";
import { Address } from "../address";
import { ContractFunction } from "./function";
import { getMainnetProvider } from "../testutils";
import { SmartContract } from "./smartContract";
import * as errors from "../errors";
import { AddressValue } from "./typesystem";

describe("test queries on mainnet", function () {
    let provider = getMainnetProvider();
    let delegationContract = new SmartContract({ address: new Address("drt1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q8vqld4") });

    it("delegation: should getTotalStakeByType", async () => {
        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getTotalStakeByType")
        });

        assert.isTrue(response.isSuccess());
        assert.lengthOf(response.returnData, 5);
    });

    it("delegation: should getNumUsers", async () => {
        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getNumUsers")
        });

        assert.isTrue(response.isSuccess());
        assert.lengthOf(response.returnData, 1);
        assert.isAtLeast(response.gasUsed.valueOf(), 20000000);
        assert.isAtMost(response.gasUsed.valueOf(), 50000000);
    });

    it("delegation: should getFullWaitingList", async function() {
        this.timeout(20000);

        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getFullWaitingList")
        });

        assert.isTrue(response.isSuccess());
        assert.isAtLeast(response.returnData.length, 20000);
    });

    it("delegation: should getClaimableRewards", async function() {
        this.timeout(5000);

        // First, expect an error (bad arguments):
        try {
            await delegationContract.runQuery(provider, {
                func: new ContractFunction("getClaimableRewards")
            });

            throw new errors.ErrTest("unexpected");
        } catch (err) {
            assert.instanceOf(err, errors.ErrContractQuery);
            assert.include(err.toString(), "wrong number of arguments");
        }

        // Then do a successful query:
        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getClaimableRewards"),
            args: [new AddressValue(new Address("drt1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssey5egf"))]
        });

        assert.isTrue(response.isSuccess());
        assert.isAtLeast(response.returnData.length, 1);
    });
});
