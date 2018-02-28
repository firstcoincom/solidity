## RightMesh Crowdsale Contracts

## Contract Requirements

### Token contract
1. Fixed cap on total supply
2. Mintable token by contract owner
3. Pausable transfers with exceptions by contract owner for transfers from whitelist addresses.

### Crowdsale contract
1. Fixed cap on total ETH being accepted in crowdsale.
2. Whitelisting addresses with max amount of ETH contribution by contract owner.
3. Non-refundable crowdsale with no minimum target.
4. Transfer token ownership back to crowdsale owner for manual minting.

### Overall crowdsale flow
1. Deploy token contract.
2. Call `pause` function on the token to pause transfers.
3. Deploy crowdsale contract with start time, end time, wei to token rate, wallet address, crowdsale cap and token address.
4. Once crowdsale is done, call `transferTokenOwnership` function within crowdsale to take back token ownership from crowdsale contract to original owner.
5. Mint tokens for ECA's and pre-contributions.
6. Call `Unpause` function to enable token transfers.
7. Go through the `tests` directory to see all the different scenarios covered.

## Backup strategies
#### Temporary Pause
1. Transfer MESH token ownership back from contract to a wallet address by calling `MeshCrowdsale#transferTokenOwnership` method. This will limit the contract's ability to mint new tokens, eventually pausing the crowdsale. By this time users who have already committed their contributions would have received their tokens and ETH would have been secured in a wallet that was passed in during the contract initialization.
2. Identify and publish reason(s) for pausing the crowdsale.
3. Provide and publish solution to the community.
4. Transfer token ownership back to the contract by calling `MeshToken#transferOwnership` method, therefore unpausing the crowdsale.

#### Updating Crowdsale contract code
1. Transfer token ownership back from contract to a wallet address by calling `MeshCrowdsale#transferTokenOwnership` method. This will limit the contracts ability to mint new tokens eventually pausing the crowdsale. By this time users who have already made their contributions would have received their tokens and ETH would have been secured in a wallet that was passed in during the contract initialization.
2. Deploy a new crowdsale contract with the updated code.
3. Transfer token ownership to the newly deployed contract by calling `MeshToken#transferOwnership` method, therefore starting the crowdsale with updated code.

#### Issuing refunds
1. Since this is a non-refundable sale, their is no logic in the contract that allows users to withdraw ETH in case the desired targets are not reached. However, if needed to refund ETH to the contributing wallets, we will need to write a new contract that will allow users to withdraw their ETH.
2. The new contract will be reading off data from the existing crowdsale contract.
3. This will require communication between the newly deployed contract for refund and the existing crowdsale contract to validate the limits on amount of ETH each user is able to withdraw.
  - The gas requirements will increase due to cross contracts communication.


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

### Deploying using geth node
#### Geth Setup
1. Install geth ethereum node.
2. Get access to the machine which hosts the geth node.
3. Attach to geth javascript console.
```
$ sudo geth attach /media/geth/geth.ipc
```
4. Check the status of geth node. Make sure it's synced to the latest block.
```
> web3.eth.blockNumber
```
5. Check all available accounts
```
> eth.accounts
```
6. Check balance of the account for contract deployment. Make sure that the account has enough funds.
```
> eth.getBalance(eth.accounts[0])
```
7. Unlock the account so that you can use it for deployment.
```
> personal.unlockAccount(eth.accounts[0])
```
8. Configure the address-config.js file based on the comments in the file.
```
$ vim config/address-config.js
```

#### Deploying and interacting with contracts

##### Phase 1 (setup before crowdsale)
1. Deploy the token contract and verify the code on ether scan. After the contract is deployed, fill the token
contract address in the address config file.
```
$ node 1_deploy_token.js
```
2. Deploy timelock contract and verify the code on ether scan. After the contract is deployed, fill the timelock contract addtress in the address config file.
```
$ node 2_deploy_timelock.js
```
3. Update `allocation-config.js` with correct addresses and amounts and then call the timelock contract to update the same within the contract.
```
$ node 3_allocate_tokens.js
```
4. Once the allocation is done, call the timelock contract to finish allocation. Note, once this is done allocations cannot be changed after that.
```
node 4_finish_allocation.js
```
> Repeat steps 2-4 if you need multiple vesting contracts.

##### Phase 2 (crowdsale setup)
1. Deploy the crowdsale contract and verify the code on ether scan. After the contract is deployed, fill the crowdsale contract address in the address-config.js file. The parameters of crowdsale contract can be configured in crowdsale-config.js file.
```
$ node 5_deploy_crowdsale.js
```
2. Transfer the token contract ownership to crowdsale contract. So the crowdsale contract will be able to mint tokens.
```
$ node 6_token_ownership_to_crowdsale.js
```
3. Finalize ETH to token rate and crowdsale cap and update the contract.
```
$ node 7_set_rate.js
$ node 7_set_cap.js
```
4. Finalize minimum contribution and update the contract.
```
$ node 8_set_minimum_contribution.js
```
5. Set up a whitelist agent, which can whitelist contributors to get into the crowsale. The whitelist agent's address is configured in address-config.js.
```
$ node 9_add_whitelisting_agent.js
```
6. Whitelist agent now can white list contributors. Only whitelisted contributors can participate into the ico. The limit and contributor's address can be configured in whitelist-config.js.
```
$ node 10_whitelist.js
```
7. Once crowdsale has started, you can now call the crowdsale to mint predefined tokens.
```
$ node 11_mint_predefined_tokens.js
```
8. Once the public crowsale is done. The crowdsale contract will transfer the ownership of token contract back to the owner.
```
$ node 12_token_ownership_to_owner.js
```
> Repeat Phase 2 with a different rate if needed.

##### Phase 3 (after crowdsale)
1. The next step is for the owner to mint tokens for pre-allocated tokens.
```
$ node 13_mint_tokens.js
```
2. Enable individual address to allow transfers to distribute tokens to ECA's and pre-contributors.
```
$ node 14_add_transfer_exception.js
```
3. Unpause the token contract to enable token transfers on the ethereum mainet.
```
$ node 15_unpause_token.js
```
