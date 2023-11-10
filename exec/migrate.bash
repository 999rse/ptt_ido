# Remove dir: build, abi
rm -rf build abi dist

# Migrate
truffle migrate --network development

# Extract ABI's
node exec/extract_abi_token.js
node exec/extract_abi_ido_token.js