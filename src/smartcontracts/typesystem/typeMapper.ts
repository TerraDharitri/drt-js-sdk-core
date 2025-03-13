import * as errors from "../../errors";
import { AddressType } from "./address";
import { BooleanType } from "./boolean";
import { BytesType } from "./bytes";
import { CompositeType } from "./composite";
import { EnumType } from "./enum";
import { ListType, OptionType } from "./generic";
import { H256Type } from "./h256";
import {
    BigIntType,
    BigUIntType,
    I16Type,
    I32Type,
    I64Type,
    I8Type,
    U16Type,
    U32Type,
    U64Type,
    U8Type,
} from "./numerical";
import { StructFieldDefinition, StructType } from "./struct";
import { TokenIdentifierType } from "./tokenIdentifier";
import { Type, CustomType } from "./types";
import { VariadicType } from "./variadic";
import { OptionalType } from "./algebraic";
import { TupleType } from ".";

type TypeConstructor = new (...typeParameters: Type[]) => Type;

export class TypeMapper {
    private readonly openTypesConstructors: Map<string, TypeConstructor>;
    private readonly closedTypesMap: Map<string, Type>;

    constructor(customTypes: CustomType[] = []) {
        this.openTypesConstructors = new Map<string, TypeConstructor>([
            ["Option", OptionType],
            ["List", ListType],
            // For the following open generics, we use a slightly different typing than the one defined by dharitri-wasm-rs (temporary workaround).
            ["VarArgs", VariadicType],
            ["MultiResultVec", VariadicType],
            ["variadic", VariadicType],
            ["OptionalArg", OptionalType],
            ["optional", OptionalType],
            ["OptionalResult", OptionalType],
            ["MultiArg", CompositeType],
            ["MultiResult", CompositeType],
            ["multi", CompositeType],
            // Perhaps we can adjust the ABI generator to only output "tuple", instead of "tupleN"?
            ["tuple", TupleType],
            ["tuple2", TupleType],
            ["tuple3", TupleType],
            ["tuple4", TupleType],
            ["tuple5", TupleType],
            ["tuple6", TupleType],
            ["tuple7", TupleType],
            ["tuple8", TupleType],
        ]);

        // For closed types, we hold actual type instances instead of type constructors (no type parameters needed).
        this.closedTypesMap = new Map<string, Type>([
            ["u8", new U8Type()],
            ["u16", new U16Type()],
            ["u32", new U32Type()],
            ["u64", new U64Type()],
            ["BigUint", new BigUIntType()],
            ["i8", new I8Type()],
            ["i16", new I16Type()],
            ["i32", new I32Type()],
            ["i64", new I64Type()],
            ["Bigint", new BigIntType()],
            ["bool", new BooleanType()],
            ["bytes", new BytesType()],
            ["Address", new AddressType()],
            ["H256", new H256Type()],
            ["TokenIdentifier", new TokenIdentifierType()],
        ]);

        for (const customType of customTypes) {
            this.closedTypesMap.set(customType.getName(), customType);
        }
    }

    mapType(type: Type): Type {
        let isGeneric = type.isGenericType();

        if (type instanceof EnumType) {
            return type;
        }

        if (type instanceof StructType) {
            // This will call mapType() recursively, for all the struct's fields.
            return this.mapStructType(type);
        }

        if (isGeneric) {
            // This will call mapType() recursively, for all the type parameters.
            return this.mapGenericType(type);
        }

        let knownClosedType = this.closedTypesMap.get(type.getName());
        if (!knownClosedType) {
            throw new errors.ErrTypingSystem(`Cannot map the type "${type.getName()}" to a known type`);
        }

        return knownClosedType;
    }

    feedCustomType(type: Type): void {
        this.closedTypesMap.delete(type.getName());
        this.closedTypesMap.set(type.getName(), type);
    }

    private mapStructType(type: StructType): StructType {
        let mappedFields = type.fields.map(
            (item) => new StructFieldDefinition(item.name, item.description, this.mapType(item.type))
        );
        let mappedStruct = new StructType(type.getName(), mappedFields);
        return mappedStruct;
    }

    private mapGenericType(type: Type): Type {
        let typeParameters = type.getTypeParameters();
        let mappedTypeParameters = typeParameters.map((item) => this.mapType(item));

        let constructor = this.openTypesConstructors.get(type.getName());
        if (!constructor) {
            throw new errors.ErrTypingSystem(`Cannot map the generic type "${type.getName()}" to a known type`);
        }

        return new constructor(...mappedTypeParameters);
    }
}
