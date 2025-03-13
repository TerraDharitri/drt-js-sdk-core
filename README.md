# Numbat SDK for JavaScript

Numbat SDK for JavaScript and TypeScript (written in TypeScript).

## Documentation

[TypeDoc](https://TerraDharitri.github.io/dharitrisdk-docs/drtjs/latest)

## CHANGELOG

[CHANGELOG](CHANGELOG.md)

## Distribution

[npm](https://www.npmjs.com/package/@terradharitri/drtjs)

## Usage

The most comprehensive usage examples are captured within the unit and the integration tests. Specifically, in the `*.spec.ts` files of the source code. For example:

 - [transaction.dev.net.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/transaction.dev.net.spec.ts)
 - [address.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/address.spec.ts)
 - [transactionPayloadBuilders.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/transactionPayloadBuilders.spec.ts)
 - [smartContract.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/smartContract.spec.ts)
 - [smartContract.dev.net.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/smartContract.dev.net.spec.ts)
 - [query.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/query.spec.ts)
 - [query.main.net.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/query.main.net.spec.ts)

For advanced smart contract interaction, using ABIs, please see the following test files:

 - [interaction.dev.net.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/interaction.dev.net.spec.ts) 
 - [abiRegistry.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/typesystem/abiRegistry.spec.ts)
 - [argSerializer.spec.ts](https://github.com/TerraDharitri/dharitrisdk/tree/development/drtjs/src/smartcontracts/argSerializer.spec.ts) 

**More examples and documentation on writing ABI-aware custom interactors for smart contracts is coming soon!**

Additional examples (please note that they are slighly _out-of-date_ though) can be found here:

 - [Basic Example](https://github.com/TerraDharitri/dharitrisdk/tree/development/docs/drtjs/examples/basic)
 - [Backend Dispatcher](https://github.com/TerraDharitri/dharitrisdk/tree/development/docs/drtjs/examples/backend-dispatcher)

### Synchronizing network parameters

```
let provider = new ProxyProvider("https://localhost:7950");
await NetworkConfig.getDefault().sync(provider);

console.log(NetworkConfig.getDefault().MinGasPrice);
console.log(NetworkConfig.getDefault().ChainID);
```

### Synchronizing an account object

```
let addressOfAlice = new Address("drt1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssey5egf");
let alice = new Account(addressOfAlice);
await alice.sync(provider);

console.log(alice.nonce);
console.log(alice.balance);
```

### Creating value-transfer transactions

```
await alice.sync(provider);

let tx = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: new GasLimit(70000),
    receiver: new Address("drt1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqlqde3c"),
    value: Balance.rewa(1)
});

tx.setNonce(alice.nonce);
await signer.sign(tx);
await tx.send(provider);
```

### Creating Smart Contract transactions

```
let contract = new SmartContract({ address: new Address("drt1qqqqqqqqqqqqqpgq3ytm9m8dpeud35v3us20vsafp77smqghd8ssgwucv7") });
let addressOfCarol = new Address("drt1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq889n6e");

let tx = contract.call({
    func: new ContractFunction("transferToken"),
    gasLimit: new GasLimit(5000000),
    args: [new AddressValue(addressOfCarol), new U64Value(1000)]
});

tx.setNonce(alice.nonce);
await signer.sign(tx);
await tx.send(provider);
```

### Querying Smart Contracts

```
let contract = new SmartContract({ address: new Address("drt1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q8vqld4") });
let addressOfAlice = new Address("drt1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssey5egf");

let response = await contract.runQuery(provider, {
    func: new ContractFunction("getClaimableRewards"),
    args: [new AddressValue(addressOfAlice)]
});

console.log(response.isSuccess());
console.log(response.returnData);
```

### Waiting for transactions to be processed

```
await tx1.send(provider);
await tx2.send(provider);
await tx3.send(provider);

await tx1.awaitExecuted(provider);
await tx2.awaitPending(provider);

let watcher = new TransactionWatcher(tx3.hash, provider);
await watcher.awaitStatus(status => status.isExecuted());
```

### Managing the sender nonce locally

```
await alice.sync(provider);

txA.setNonce(alice.nonce);
alice.incrementNonce();
txB.setNonce(alice.nonce);
alice.incrementNonce();

await signer.sign(txA);
await signer.sign(txB);

await txA.send(provider);
await txB.send(provider);

await txA.awaitExecuted(provider);
await txB.awaitExecuted(provider);
```

## Installation

`drtjs` is delivered via [npm](https://www.npmjs.com/package/@terradharitri/drtjs), therefore it can be installed as follows:

```
npm install @terradharitri/drtjs
```

## Development

Feel free to skip this section if you are not a contributor.

### Prerequisites

`browserify` is required to compile the browser-friendly versions of `drtjs`. It can be installed as follows:

```
npm install --global browserify
```

### Building the library

In order to compile `drtjs`, run the following:

```
npm install
npm run compile
npm run compile-browser
npm run compile-browser-min
```

### Running the tests

#### On NodeJS

In order to run the tests **on NodeJS**, do as follows:

```
npm run tests-unit
npm run tests-devnet
npm run tests-testnet
npm run tests-mainnet
```

#### In the browser

Make sure you have the package `http-server` installed globally.

```
npm install --global http-server
```

In order to run the tests **in the browser**, do as follows:

```
make clean && npm run browser-tests
```

#### Notes

For the `devnet` tests, make sure you have a *devnet* running locally. A local *devnet* can be started from the Numbat IDE or from [drtpy](https://docs.dharitri.org/developers/setup-a-local-testnet-drtpy).
