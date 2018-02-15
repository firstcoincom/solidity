module.exports = {
  ownerAddress: '', // the account which deploy and own the contracts
  whitelistAgentAddress: '', // the account which is able to whitelist contributor
  ethWalletAddress: '', // the account which holds the eth fund
  transferExceptionAddress: '',
  newOwnerAddress: '', // public key of the new contract owner, this should be a secure 'offline' address

  // these variables are needed for post deployment scripts to interact with the contract
  // change these variables to interact with the right contract
  tokenAddress: '',
  crowdsaleAddress: '',
}
