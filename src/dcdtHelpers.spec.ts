import {assert} from "chai";
import {DcdtHelpers} from "./dcdtHelpers";
import {DCDT_TRANSFER_GAS_LIMIT, DCDT_TRANSFER_VALUE} from "./constants";

describe("test DcdtHelpers.extractFieldsFromDcdtTransferDataField", () => {
    it("should throw exceptions due to bad input", () => {
        assert.throw(() => DcdtHelpers.extractFieldsFromDcdtTransferDataField("invalid dcdt transfer"));
        assert.throw(() => DcdtHelpers.extractFieldsFromDcdtTransferDataField("dcdtTransfer@aa@01")); // case sensitive protection
        assert.throw(() => DcdtHelpers.extractFieldsFromDcdtTransferDataField("DCDTTransfer@aa@1")); // wrong sized second argument
    });

    it("should work", () => {
        let result = DcdtHelpers.extractFieldsFromDcdtTransferDataField("DCDTTransfer@aa@01");
        assert.equal(result.tokenIdentifier, "aa");
        assert.equal(result.amount, "1");

        result = DcdtHelpers.extractFieldsFromDcdtTransferDataField("DCDTTransfer@4142432d317132773365@2cd76fe086b93ce2f768a00b229fffffffffff");
        assert.equal(result.tokenIdentifier, "4142432d317132773365");
        assert.equal(result.amount, "999999999999999999999999999999999999999999999");
    });
});

describe("test DcdtHelpers.getTxFieldsForDcdtTransfer", () => {
    it("should work", () => {
        let {value, data, gasLimit} = DcdtHelpers.getTxFieldsForDcdtTransfer("4142432d317132773365", "999999999999999999999999999999999999999999999");
        assert.equal(value, DCDT_TRANSFER_VALUE);
        assert.equal(gasLimit, DCDT_TRANSFER_GAS_LIMIT);
        assert.equal(data, "DCDTTransfer@4142432d317132773365@2cd76fe086b93ce2f768a00b229fffffffffff");
    });
});
