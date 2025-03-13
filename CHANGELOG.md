# Change Log

All notable changes will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [5.0.1] - 07.06.2021

-   [Feat/nft token #3](https://github.com/TerraDharitri/dharitrisdk-drtjs/pull/3)

## [5.0.0] - 19.05.2021

-   [Remove event target and add callback #310](https://github.com/TerraDharitri/dharitrisdk/pull/310)
-   [FIx abi registry for struct type #309](https://github.com/TerraDharitri/dharitrisdk/pull/309)
-   [added helpers functions for dcdt and sc arguments parser #301](https://github.com/TerraDharitri/dharitrisdk/pull/301)
-   Update packages #298, #299, #302, #303, #304, #305

## [4.2.2] - 06.05.2021

-   [Fix infinite loop on wallet connect logout #294](https://github.com/TerraDharitri/dharitrisdk/pull/294)

## [4.2.1] - 05.05.2021

-   [Fix get transaction endpoint #290](https://github.com/TerraDharitri/dharitrisdk/pull/290)

## [4.2.0] - 05.05.2021

-   [Add wallet connect provider #286](https://github.com/TerraDharitri/dharitrisdk/pull/286)

## [4.1.0] - 29.04.2021

-   [Add decode string and decode bignumber #282](https://github.com/TerraDharitri/dharitrisdk/pull/282)
-   [Add generic methods for GET and POST #280](https://github.com/TerraDharitri/dharitrisdk/pull/280)
-   [Fix Dapp callback URL #278](https://github.com/TerraDharitri/dharitrisdk/pull/278)
-   [Add dcdtTokens endpoints #272](https://github.com/TerraDharitri/dharitrisdk/pull/272)
-   [Add TupleType #268](https://github.com/TerraDharitri/dharitrisdk/pull/268)
-   Other minor fixes #281 #279 #277 #276 #265 #260 #259

## [4.0.3] - 02.04.2021

-   [ABI-based contract interaction. Redesigned typing system #107](https://github.com/TerraDharitri/dharitrisdk/pull/107)
-   [Add `variadic` type for typeMapper #257](https://github.com/TerraDharitri/dharitrisdk/pull/257)

## [3.1.3] - 26.03.2021

-   [Fixed ledger signing using hash fields #245](https://github.com/TerraDharitri/dharitrisdk/pull/245)

## [3.1.2] - 24.03.2021

-   [Fixed ledger login feature #240](https://github.com/TerraDharitri/dharitrisdk/pull/240)
-   [Fixed asBool value for contract query response #241](https://github.com/TerraDharitri/dharitrisdk/pull/241)

## [3.1.1] - 22.03.2021

-   [Fixed a bug on account query regarding usernames #235](https://github.com/TerraDharitri/dharitrisdk/pull/235)

## [3.1.0] - 03.03.2021

-   [Added network status endpoint #229](https://github.com/TerraDharitri/dharitrisdk/pull/229)
-   [Sign tx with hash functionality #217](https://github.com/TerraDharitri/dharitrisdk/pull/217)

## [3.0.0] - 03.03.2021

-   [Switched from native BigInt to bignumber.js #218](https://github.com/TerraDharitri/dharitrisdk/pull/218)

## [2.3.0] - 16.02.2021

-   [Minor bugfixes and new getNetworkStats function #203](https://github.com/TerraDharitri/dharitrisdk/pull/203)

## [2.2.2] - 11.02.2021

-   [Walletcore minor fixes on Uint8Array casting before Buffers are passet to tweetnacl #198](https://github.com/TerraDharitri/dharitrisdk/pull/198)

## [2.2.1] - 10.02.2021

-   [Walletcore improvements - minor fixes on PEM parsing, added tests #195](https://github.com/TerraDharitri/dharitrisdk/pull/195)

## [2.2.0] - 09.02.2021

-   [Add api provider and userName to getAccount #191](https://github.com/TerraDharitri/dharitrisdk/pull/191)

## [2.1.0] - 05.02.2021

-   [Add logout on dapp #183](https://github.com/TerraDharitri/dharitrisdk/pull/183)

## [2.0.0] - 03.02.2021

-   [Fix query http request #178](https://github.com/TerraDharitri/dharitrisdk/pull/178)

## [1.1.9] - 03.02.2021

-   [Add handling for null on Contract return data #160](https://github.com/TerraDharitri/dharitrisdk/pull/160)

## [1.1.8] - 15.01.2021

-   Publish drtjs via Github Actions #151.
-   Minor fixes for dApps (wallet integration) #153.

## [1.1.7] - 15.01.2021

-   Bring core-js into drtjs (user wallets & signing, validator signing).
-   Run all tests (unit and integration) in browser, as well.
-   Separate builds: drtjs with / without wallet components.

## [1.1.5] - 06.01.2021

-   Updated axios library due to security vulnerabilities.

## [1.1.4] - 10.12.2020

-   Add some utility functions for ABI (needed for some interaction examples among SC templates).

## [1.1.3] - 03.12.2020

Pull requests:

-   [New type system (with generics), codecs (dharitri-wasm alike) and ABI prototype.](https://github.com/TerraDharitri/dharitrisdk/pull/87)
-   [Compute TX hash off-line](https://github.com/TerraDharitri/dharitrisdk/pull/93)

In more detail:

-   New typing system to better match dharitri-wasm's typing system (our standard typing system for smart contracts). Generics (simple or nested) included.
-   ABI prototype (functions, structures).
-   Codec utilities
-   Optional arguments supported as well.
-   Compute TX hash in an off-line fashion (not relying on the Node / Proxy).

Breaking changes:

-   Members of `Argument` class have been renamed.
-   Members of `Balance` class have been renamed.

## [1.1.2] - 17.11.2020

-   Removed useless check and add the current Ledger selection as sender.

## [1.1.1] - 17.11.2020

-   Corrected transaction object sent to the wallet provider.

## [1.1.0] - 13.11.2020

-   Add dharitriwallet and hardware wallet support.

## [1.0.8] - 03.11.2020

-   Export `backendSigner` as well (for `NodeJS` version).
-   Fix (update) the example `backend-dispatcher`.

## [1.0.7] - 02.11.2020

-   Moved release `1.0.7` out of beta.

## [1.0.7-beta1] - 30.10.2020

-   Added comments & documentation.
-   Implemented utilities for contract queries.
-   Made `drtjs` smaller, for loading in browsers.
-   Applied several steps of refactoring.
-   Improved reporting of HTTP-related errors.
-   Fixed parsing of big integers in `axios` responses.
-   Implemented a simple logger component.
-   Improved tests (added more unit tests and integration tests).
-   Fixed implementation of `length()` for `TransactionPayload`.
