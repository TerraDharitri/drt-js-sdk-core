.PHONY: clean browser-tests

browser-tests: out-browser-tests/drtjs-tests-unit.js out-browser-tests/drtjs-tests-devnet.js out-browser-tests/drtjs-tests-testnet.js out-browser-tests/drtjs-tests-mainnet.js

out-browser-tests/drtjs-tests-unit.js: out-tests
	npx browserify $(shell find out-tests -type f -name '*.js' ! -name '*.net.spec.*') --require buffer/:buffer -o out-browser-tests/drtjs-tests-unit.js --standalone drtjs-tests

out-browser-tests/drtjs-tests-devnet.js: out-tests
	npx browserify $(shell find out-tests -type f -name '*.js' ! -name '*.spec.*') $(shell find out-tests -type f -name '*.dev.net.spec.js') --require buffer/:buffer -o out-browser-tests/drtjs-tests-devnet.js --standalone drtjs-tests

out-browser-tests/drtjs-tests-testnet.js: out-tests
	npx browserify $(shell find out-tests -type f -name '*.js' ! -name '*.spec.*') $(shell find out-tests -type f -name '*.test.net.spec.js') --require buffer/:buffer -o out-browser-tests/drtjs-tests-testnet.js --standalone drtjs-tests

out-browser-tests/drtjs-tests-mainnet.js: out-tests
	npx browserify $(shell find out-tests -type f -name '*.js' ! -name '*.spec.*') $(shell find out-tests -type f -name '*.main.net.spec.js') --require buffer/:buffer -o out-browser-tests/drtjs-tests-mainnet.js --standalone drtjs-tests

out-tests:
	npx tsc -p tsconfig.tests.json

clean:
	rm -rf out-tests
	rm -rf out-browser-tests
