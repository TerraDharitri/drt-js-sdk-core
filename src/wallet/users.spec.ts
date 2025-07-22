import { assert } from "chai";
import path from "path";
import { Account } from "../accounts";
import { Address, ErrBadMnemonicEntropy, ErrInvariantFailed, Message, Transaction } from "../core";
import {
    DummyMnemonicOf12Words,
    loadMnemonic,
    loadPassword,
    loadTestKeystore,
    loadTestWallet,
    TestWallet,
} from "./../testutils/wallets";
import { Randomness } from "./crypto";
import { Mnemonic } from "./mnemonic";
import { UserSecretKey } from "./userKeys";
import { UserSigner } from "./userSigner";
import { UserVerifier } from "./userVerifier";
import { UserWallet } from "./userWallet";

describe("test user wallets", () => {
    let alice: TestWallet, bob: TestWallet, carol: TestWallet;
    let password: string;
    let dummyMnemonic: string;

    before(async function () {
        alice = await loadTestWallet("alice");
        bob = await loadTestWallet("bob");
        carol = await loadTestWallet("carol");
        password = await loadPassword();
        dummyMnemonic = await loadMnemonic();
    });

    it("should generate mnemonic", () => {
        let mnemonic = Mnemonic.generate();
        let words = mnemonic.getWords();
        assert.lengthOf(words, 24);
    });

    it("should convert entropy to mnemonic and back", () => {
        function testConversion(text: string, entropyHex: string) {
            const entropyFromMnemonic = Mnemonic.fromString(text).getEntropy();
            const mnemonicFromEntropy = Mnemonic.fromEntropy(Buffer.from(entropyHex, "hex"));

            assert.equal(Buffer.from(entropyFromMnemonic).toString("hex"), entropyHex);
            assert.equal(mnemonicFromEntropy.toString(), text);
        }

        testConversion(
            "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
            "00000000000000000000000000000000",
        );

        testConversion(
            "moral volcano peasant pass circle pen over picture flat shop clap goat never lyrics gather prepare woman film husband gravity behind test tiger improve",
            "8fbeb688d0529344e77d225898d4a73209510ad81d4ffceac9bfb30149bf387b",
        );

        assert.throws(
            () => {
                Mnemonic.fromEntropy(Buffer.from("abba", "hex"));
            },
            ErrBadMnemonicEntropy,
            `Bad mnemonic entropy`,
        );
    });
    //skipped for now
    // it("should derive keys", async () => {
    //     let mnemonic = Mnemonic.fromString(dummyMnemonic);

    //     assert.equal(mnemonic.deriveKey(0).hex(), alice.secretKeyHex);
    //     assert.equal(mnemonic.deriveKey(1).hex(), bob.secretKeyHex);
    //     assert.equal(mnemonic.deriveKey(2).hex(), carol.secretKeyHex);
    // });

    it("should derive keys (12 words)", async () => {
        const mnemonic = Mnemonic.fromString(DummyMnemonicOf12Words);

        assert.equal(
            mnemonic.deriveKey(0).generatePublicKey().toAddress().toBech32(),
            "drt1l8g9dk3gz035gkjhwegsjkqzdu3augrwhcfxrnucnyyrpc2220pq4flasr",
        );
        assert.equal(
            mnemonic.deriveKey(1).generatePublicKey().toAddress().toBech32(),
            "drt1fmhwg84rldg0xzngf53m0y607wvefvamh07n2mkypedx27lcqntsg78vxl",
        );
        assert.equal(
            mnemonic.deriveKey(2).generatePublicKey().toAddress().toBech32(),
            "drt1tyuyemt4xz2yjvc7rxxp8kyfmk2n3h8gv3aavzd9ru4v2vhrkcksuhwdgv",
        );

        assert.equal(
            mnemonic.deriveKey(0).generatePublicKey().toAddress("test").toBech32(),
            "test1l8g9dk3gz035gkjhwegsjkqzdu3augrwhcfxrnucnyyrpc2220pqc6tnnf",
        );
        assert.equal(
            mnemonic.deriveKey(1).generatePublicKey().toAddress("xdrt").toBech32(),
            "xdrt1fmhwg84rldg0xzngf53m0y607wvefvamh07n2mkypedx27lcqnts0f2w3t",
        );
        assert.equal(
            mnemonic.deriveKey(2).generatePublicKey().toAddress("ydrt").toBech32(),
            "ydrt1tyuyemt4xz2yjvc7rxxp8kyfmk2n3h8gv3aavzd9ru4v2vhrkckswmkvs2",
        );
    });

    it("should create secret key", () => {
        const keyHex = alice.secretKeyHex;
        const fromBuffer = new UserSecretKey(Buffer.from(keyHex, "hex"));
        const fromArray = new UserSecretKey(Uint8Array.from(Buffer.from(keyHex, "hex")));
        const fromHex = UserSecretKey.fromString(keyHex);

        assert.equal(fromBuffer.hex(), keyHex);
        assert.equal(fromArray.hex(), keyHex);
        assert.equal(fromHex.hex(), keyHex);
    });

    it("should compute public key (and address)", () => {
        let secretKey: UserSecretKey;

        secretKey = new UserSecretKey(Buffer.from(alice.secretKeyHex, "hex"));
        assert.equal(secretKey.generatePublicKey().hex(), alice.address.hex());
        assert.deepEqual(secretKey.generatePublicKey().toAddress(), alice.address);

        secretKey = new UserSecretKey(Buffer.from(bob.secretKeyHex, "hex"));
        assert.equal(secretKey.generatePublicKey().hex(), bob.address.hex());
        assert.deepEqual(secretKey.generatePublicKey().toAddress(), bob.address);

        secretKey = new UserSecretKey(Buffer.from(carol.secretKeyHex, "hex"));
        assert.equal(secretKey.generatePublicKey().hex(), carol.address.hex());
        assert.deepEqual(secretKey.generatePublicKey().toAddress(), carol.address);
    });

    it("should throw error when invalid input", () => {
        assert.throw(() => new UserSecretKey(Buffer.alloc(42)), ErrInvariantFailed);
        assert.throw(() => UserSecretKey.fromString("foobar"), ErrInvariantFailed);
    });

    it("should handle PEM files", () => {
        assert.equal(UserSecretKey.fromPem(alice.pemFileText).hex(), alice.secretKeyHex);
        assert.equal(UserSecretKey.fromPem(bob.pemFileText).hex(), bob.secretKeyHex);
        assert.equal(UserSecretKey.fromPem(carol.pemFileText).hex(), carol.secretKeyHex);
    });

    it("should create and load keystore files (with secret keys)", function () {
        this.timeout(10000);

        let aliceSecretKey = UserSecretKey.fromString(alice.secretKeyHex);
        let bobSecretKey = UserSecretKey.fromString(bob.secretKeyHex);
        let carolSecretKey = UserSecretKey.fromString(carol.secretKeyHex);

        console.time("encrypt");
        let aliceKeyFile = UserWallet.fromSecretKey({ secretKey: aliceSecretKey, password: password });
        let bobKeyFile = UserWallet.fromSecretKey({ secretKey: bobSecretKey, password: password });
        let carolKeyFile = UserWallet.fromSecretKey({ secretKey: carolSecretKey, password: password });
        console.timeEnd("encrypt");

        assert.equal(aliceKeyFile.toJSON().bech32, alice.address.toBech32());
        assert.equal(bobKeyFile.toJSON().bech32, bob.address.toBech32());
        assert.equal(carolKeyFile.toJSON().bech32, carol.address.toBech32());

        console.time("decrypt");
        assert.deepEqual(UserWallet.decryptSecretKey(aliceKeyFile.toJSON(), password), aliceSecretKey);
        assert.deepEqual(UserWallet.decryptSecretKey(bobKeyFile.toJSON(), password), bobSecretKey);
        assert.deepEqual(UserWallet.decryptSecretKey(carolKeyFile.toJSON(), password), carolSecretKey);
        console.timeEnd("decrypt");

        // With provided randomness, in order to reproduce our development wallets

        aliceKeyFile = UserWallet.fromSecretKey({
            secretKey: aliceSecretKey,
            password: password,
            randomness: new Randomness({
                id: alice.keyFileObject.id,
                iv: Buffer.from(alice.keyFileObject.crypto.cipherparams.iv, "hex"),
                salt: Buffer.from(alice.keyFileObject.crypto.kdfparams.salt, "hex"),
            }),
        });

        bobKeyFile = UserWallet.fromSecretKey({
            secretKey: bobSecretKey,
            password: password,
            randomness: new Randomness({
                id: bob.keyFileObject.id,
                iv: Buffer.from(bob.keyFileObject.crypto.cipherparams.iv, "hex"),
                salt: Buffer.from(bob.keyFileObject.crypto.kdfparams.salt, "hex"),
            }),
        });

        carolKeyFile = UserWallet.fromSecretKey({
            secretKey: carolSecretKey,
            password: password,
            randomness: new Randomness({
                id: carol.keyFileObject.id,
                iv: Buffer.from(carol.keyFileObject.crypto.cipherparams.iv, "hex"),
                salt: Buffer.from(carol.keyFileObject.crypto.kdfparams.salt, "hex"),
            }),
        });

        assert.deepEqual(aliceKeyFile.toJSON(), alice.keyFileObject);
        assert.deepEqual(bobKeyFile.toJSON(), bob.keyFileObject);
        assert.deepEqual(carolKeyFile.toJSON(), carol.keyFileObject);
    });

    it("should load keystore files (with secret keys, but without 'kind' field)", async function () {
        const keyFileObject = await loadTestKeystore("withoutKind.json");
        const secretKey = UserWallet.decryptSecretKey(keyFileObject, password);

        assert.equal(
            secretKey.generatePublicKey().toAddress().toBech32(),
            "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
        );
    });

    it("should create and load keystore files (with mnemonics)", async function () {
        this.timeout(10000);

        const wallet = UserWallet.fromMnemonic({ mnemonic: dummyMnemonic, password: password });
        const json = wallet.toJSON();

        assert.equal(json.version, 4);
        assert.equal(json.kind, "mnemonic");
        assert.isUndefined(json.toBech32);

        const mnemonic = UserWallet.decryptMnemonic(json, password);
        const mnemonicText = mnemonic.toString();

        assert.equal(mnemonicText, dummyMnemonic);
        // skipped for now
        // assert.equal(mnemonic.deriveKey(0).generatePublicKey().toAddress().toBech32(), alice.address.toBech32());
        // assert.equal(mnemonic.deriveKey(1).generatePublicKey().toAddress().toBech32(), bob.address.toBech32());
        // assert.equal(mnemonic.deriveKey(2).generatePublicKey().toAddress().toBech32(), carol.address.toBech32());

        // With provided randomness, in order to reproduce our test wallets
        const expectedDummyWallet = await loadTestKeystore("withDummyMnemonic.json");
        const dummyWallet = UserWallet.fromMnemonic({
            mnemonic: dummyMnemonic,
            password: password,
            randomness: new Randomness({
                id: "5b448dbc-5c72-4d83-8038-938b1f8dff19",
                iv: Buffer.from("2da5620906634972d9a623bc249d63d4", "hex"),
                salt: Buffer.from("aa9e0ba6b188703071a582c10e5331f2756279feb0e2768f1ba0fd38ec77f035", "hex"),
            }),
        });

        assert.deepEqual(dummyWallet.toJSON(), expectedDummyWallet);
    });

    it("should create user wallet from secret key, but without 'kind' field", async function () {
        const keyFileObject = await loadTestKeystore("withoutKind.json");
        const secretKey = UserWallet.decrypt(keyFileObject, password);

        assert.equal(
            secretKey.generatePublicKey().toAddress().toBech32(),
            "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
        );
    });

    it("should loadSecretKey, but without 'kind' field", async function () {
        const testdataPath = path.resolve(__dirname, "..", "testdata/testwallets");
        const keystorePath = path.resolve(testdataPath, "withoutKind.json");
        const secretKey = UserWallet.loadSecretKey(keystorePath, password);

        assert.equal(
            secretKey.generatePublicKey().toAddress().toBech32(),
            "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
        );
    });

    it("should throw when calling loadSecretKey with unecessary address index", async function () {
        const keyFileObject = await loadTestKeystore("alice.json");

        assert.throws(
            () => UserWallet.decrypt(keyFileObject, password, 42),
            "addressIndex must not be provided when kind == 'secretKey'",
        );
    });
    // skipped for now
    // it("should loadSecretKey with mnemonic", async function () {
    //     const keyFileObject = await loadTestKeystore("withDummyMnemonic.json");

    //     assert.equal(
    //         UserWallet.decrypt(keyFileObject, password, 0).generatePublicKey().toAddress().toBech32(),
    //         "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
    //     );
    //     assert.equal(
    //         UserWallet.decrypt(keyFileObject, password, 1).generatePublicKey().toAddress().toBech32(),
    //         "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2",
    //     );
    //     assert.equal(
    //         UserWallet.decrypt(keyFileObject, password, 2).generatePublicKey().toAddress().toBech32(),
    //         "drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q",
    //     );
    // });

    it("should sign transactions", async () => {
        let signer = new Account(
            UserSecretKey.fromString("7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017"),
        );
        let verifier = new UserVerifier(
            UserSecretKey.fromString(
                "7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017",
            ).generatePublicKey(),
        );

        // With data field
        let transaction = new Transaction({
            nonce: 0n,
            value: 0n,
            sender: Address.newFromBech32("drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu"),
            receiver: Address.newFromBech32("drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha"),
            gasPrice: 1000000000n,
            gasLimit: 50000n,
            data: new TextEncoder().encode("foo"),
            chainID: "1",
        });

        let serialized = transaction.serializeForSigning();
        let signature = await signer.sign(serialized);

        assert.deepEqual(await signer.sign(serialized), await signer.sign(Uint8Array.from(serialized)));
        assert.deepEqual(
            serialized.toString(),
            `{"nonce":0,"value":"0","receiver":"drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha","sender":"drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu","gasPrice":1000000000,"gasLimit":50000,"data":"Zm9v","chainID":"1","version":2}`,
        );
        assert.equal(
            Buffer.from(signature).toString("hex"),
            "7a0807f21d65db52765aaafa0e9dff1572fd2979ece2c354ff7121c69aefe4ff54288105c9b5e8c249988fa28d7bd32e391edf0680c3a4ae3af7e113bb905701",
        );
        assert.isTrue(await verifier.verify(serialized, signature));

        // Without data field
        transaction = new Transaction({
            nonce: 8n,
            value: 10000000000000000000n,
            sender: Address.newFromBech32("drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu"),
            receiver: Address.newFromBech32("drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha"),
            gasPrice: 1000000000n,
            gasLimit: 50000n,
            chainID: "1",
        });

        serialized = transaction.serializeForSigning();
        signature = await signer.sign(serialized);

        assert.deepEqual(await signer.sign(serialized), await signer.sign(Uint8Array.from(serialized)));
        assert.equal(
            serialized.toString(),
            `{"nonce":8,"value":"10000000000000000000","receiver":"drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha","sender":"drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu","gasPrice":1000000000,"gasLimit":50000,"chainID":"1","version":2}`,
        );
        assert.equal(
            Buffer.from(signature).toString("hex"),
            "d81b5ec1572662703395c984813dd7e0c7d085571616240d35fcc4241ec808427fa74b6f992c04adcaa8629d72e4d2dec2c85ab59208e7265bc2b715933e8307",
        );
    });

    it("guardian should sign transactions from PEM", async () => {
        // bob is the guardian
        let signer = new UserSigner(
            UserSecretKey.fromString("7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017"),
        );
        let verifier = new UserVerifier(
            UserSecretKey.fromString(
                "7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017",
            ).generatePublicKey(),
        );
        let guardianSigner = new UserSigner(UserSecretKey.fromPem(bob.pemFileText));

        // With data field
        let transaction = new Transaction({
            nonce: 0n,
            value: 0n,
            receiver: Address.newFromBech32("drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha"),
            sender: Address.newFromBech32("drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu"),
            gasPrice: 1000000000n,
            gasLimit: 50000n,
            data: new TextEncoder().encode("foo"),
            chainID: "1",
            guardian: Address.newFromBech32("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"),
            options: 2,
            version: 2,
        });

        let serialized = transaction.serializeForSigning();
        let signature = await signer.sign(serialized);
        let guardianSignature = await guardianSigner.sign(serialized);

        assert.deepEqual(
            serialized.toString(),
            `{"nonce":0,"value":"0","receiver":"drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha","sender":"drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu","gasPrice":1000000000,"gasLimit":50000,"data":"Zm9v","chainID":"1","version":2,"options":2,"guardian":"drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"}`,
        );
        assert.equal(
            Buffer.from(signature).toString("hex"),
            "c106bdf2a8e204d86dab7c5753663c2a66da3b34b1ea287553b16a26e7043c3da53d80b27b8ef31cec3a67ffeed4560db98a140c4cec720ce24bf73533a42e06",
        );
        assert.equal(
            Buffer.from(guardianSignature).toString("hex"),
            "e52d887342ec63c6dba0fc7072a4e623c3c3b8f72096b05baf97d8cc684d3d6f73008467ef606b9793f486ec65e41cf48659e714c6aa65254c732c559d57ef0e",
        );
        assert.isTrue(await verifier.verify(serialized, signature));

        // Without data field
        transaction = new Transaction({
            nonce: 8n,
            value: 10000000000000000000n,
            receiver: Address.newFromBech32("drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha"),
            sender: Address.newFromBech32("drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu"),
            gasPrice: 1000000000n,
            gasLimit: 50000n,
            chainID: "1",
            guardian: Address.newFromBech32("drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"),
            options: 2,
            version: 2,
        });

        serialized = transaction.serializeForSigning();
        signature = await signer.sign(serialized);
        guardianSignature = await guardianSigner.sign(serialized);

        assert.equal(
            serialized.toString(),
            `{"nonce":8,"value":"10000000000000000000","receiver":"drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha","sender":"drt1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsxvluwu","gasPrice":1000000000,"gasLimit":50000,"chainID":"1","version":2,"options":2,"guardian":"drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2"}`,
        );
        assert.equal(
            Buffer.from(signature).toString("hex"),
            "65306c960a792b7b2c4103c933fad4475b2e8f65c35a057a09f381d9b4e15b87c4ca404f14ee1c429f8783074f09c140dd2cd61d830f2130f47ed65fbbd33b01",
        );
        assert.equal(
            Buffer.from(guardianSignature).toString("hex"),
            "c897062cc6a09f16a4f3fea2d39fc323b22aaff6df31ca0d7340f24a18cd1b6947dd811ea4388ab4fec9044b1dbdfd9a941409d53bd9e5a01b46b6fa0fc7930e",
        );
        assert.isTrue(await verifier.verify(serialized, signature));
    });

    it("should sign transactions using PEM files", async () => {
        const signer = UserSigner.fromPem(alice.pemFileText);

        const transaction = new Transaction({
            nonce: 0n,
            value: 0n,
            sender: signer.getAddress(),
            receiver: Address.newFromBech32("drt1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmqgsejha"),
            gasPrice: 1000000000n,
            gasLimit: 50000n,
            data: new TextEncoder().encode("foo"),
            chainID: "1",
        });

        const serialized = transaction.serializeForSigning();
        const signature = await signer.sign(serialized);

        assert.deepEqual(await signer.sign(serialized), await signer.sign(Uint8Array.from(serialized)));
        assert.equal(
            Buffer.from(signature).toString("hex"),
            "a12016ffe353a0940d211d07196bc921f65e7bd254571d4b47559423e3a6898d1e2de98951cec8a1af45865d7d86f65eeb90ee63cff046598435010b0ae21608",
        );
    });

    it("signs a general message", async function () {
        let signer = new UserSigner(
            UserSecretKey.fromString("7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017"),
        );
        let verifier = new UserVerifier(
            UserSecretKey.fromString(
                "7b4686f3c925f9f6571de5fa24fb6a7ac0a2e5439a48bad8ed90b6690aad6017",
            ).generatePublicKey(),
        );

        const message = new Message({
            data: new TextEncoder().encode(JSON.stringify({ foo: "hello", bar: "world" })),
        });

        const signature = await signer.sign(message.data);

        assert.deepEqual(await signer.sign(message.data), await signer.sign(Uint8Array.from(message.data)));
        assert.isTrue(await verifier.verify(message.data, signature));
        assert.isTrue(await verifier.verify(Uint8Array.from(message.data), Uint8Array.from(signature)));
        assert.isFalse(await verifier.verify(Buffer.from("hello"), signature));
        assert.isFalse(await verifier.verify(new TextEncoder().encode("hello"), signature));
    });
    // skipped for now
    // it("should create UserSigner from wallet", async function () {
    //     const keyFileObjectWithoutKind = await loadTestKeystore("withoutKind.json");
    //     const keyFileObjectWithMnemonic = await loadTestKeystore("withDummyMnemonic.json");
    //     const keyFileObjectWithSecretKey = await loadTestKeystore("withDummySecretKey.json");

    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithoutKind, password).getAddress().toBech32(),
    //         "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
    //     );
    //     // skipped for now
    //     // assert.equal(
    //     //     UserSigner.fromWallet(keyFileObjectWithMnemonic, password).getAddress().toBech32(),
    //     //     "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
    //     // );
    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithSecretKey, password).getAddress().toBech32(),
    //         "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
    //     );
    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithMnemonic, password, 0).getAddress().toBech32(),
    //         "drt1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jq4nm79l",
    //     );
    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithMnemonic, password, 1).getAddress().toBech32(),
    //         "drt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectswerhd2",
    //     );
    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithMnemonic, password, 2).getAddress().toBech32(),
    //         "drt1kp072dwz0arfz8m5lzmlypgu2nme9l9q33aty0znualvanfvmy5qd3yy8q",
    //     );

    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithMnemonic, password, 0).getAddress("test").toBech32(),
    //         "test1c7pyyq2yaq5k7atn9z6qn5qkxwlc6zwc4vg7uuxn9ssy7evfh5jqcq0sx4",
    //     );
    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithMnemonic, password, 1).getAddress("xdrt").toBech32(),
    //         "xdrt18h03w0y7qtqwtra3u4f0gu7e3kn2fslj83lqxny39m5c4rwaectsfww467",
    //     );
    //     assert.equal(
    //         UserSigner.fromWallet(keyFileObjectWithMnemonic, password, 2).getAddress("ydrt").toBech32(),
    //         "ydrt1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaqgh23pp",
    //     );
    // });

    it("should throw error when decrypting secret key with keystore-mnemonic file", async function () {
        const userWallet = UserWallet.fromMnemonic({ mnemonic: dummyMnemonic, password: `` });
        const keystoreMnemonic = userWallet.toJSON();

        assert.throws(() => {
            UserWallet.decryptSecretKey(keystoreMnemonic, ``);
        }, `Expected keystore kind to be secretKey, but it was mnemonic.`);
    });
});
