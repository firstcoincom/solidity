node_modules/.bin/truffle compile
node_modules/.bin/truffle-flattener contracts/MeshToken.sol > build/MeshToken.sol
node_modules/.bin/truffle-flattener contracts/MeshCrowdsale.sol > build/MeshCrowdsale.sol
