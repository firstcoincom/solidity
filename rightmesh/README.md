## RightMesh Crowdsale Contracts

## Contract Requirements

### Token contract
1. Fixed cap on total supply
2. Mintable token by owner
3. Pausable transfers with allowed exceptions for transfers from certain addresses.

### Crowdsale contract
1. Fixed cap on total ETH being accepted in crowdsale.
2. Whitelisting addresses for amount of ETH contribution by owner.
3. Non-refundable crowdsale with no minimum target.
4. Transfer token ownership back to crowdsale owner for manual minting.

### Overall crowdsale flow
1. Deploy token contract.
2. Call `pause` on the token to pause transfers.
3. Deploy crowdsale contract with start time, end time, wei to token rate, wallet address, crowdsale cap and token address.
4. Once crowdsale is done, call `transferTokenOwnership` within crowdsale to take back token ownership from crowdsale contract to original owner.
5. Mint tokens for ECA's and pre-contributions.
6. Call `Unpause` to enable token transfers.
7. Go through the `tests` directory to see all the different scenarios covered.


## Dev environment setup

### Setup Requirememts
1. npm 5.4.x or higher
2. node 8.7.x or higher


### Dev Setup
1. Clone this repository
```
git clone https://github.com/firstcoincom/solidity.git
```
2. Navigate to `rightmesh` directory
```
cd rightmesh
```
3. Install dependencies
```
npm install
```


### Running tests
1. In your first terminal window run the following command to start a test rpc server.
```
npm run ganache
```
2. In your second terminal window run the following command to run the tests.
```
npm test
```

### Compiling contracts
1. Run the following command in your terminal to compile the contracts.
```
npm run compile
```
2. In your build directory you will have the following files:
  - `build/MeshToken.sol` - complete token contract that can be deployed.
  - `build/MeshCrowdsale.sol` - complete crowdsale contract that can be deployed.
  - `build/contracts/MeshToken.json` - truffle build that can be deployed using truffle migrations
  - `build/contracts/MeshCrowdsale.json` - truffle build that can be deployed using truffle migrations

### Deploying using truffle
1. Adjust variables in the `migrations/2_mesh_crowdsale.js` file.
2. Run the following command to deploy to local rpc network using truffle
```
npm run migrate
```
