module.exports = {
  ownerAddress: '0x671d8610bb9abb89b0313e2ee234d1c756e1092a', // the account which deploy and own the contracts
  whitelistAgentAddress: '0x671d8610bb9abb89b0313e2ee234d1c756e1092a', // the account which is able to whitelist contributor
  ethWalletAddress: '0x671d8610bb9abb89b0313e2ee234d1c756e1092a', // the account which holds the eth fund
  transferExceptionAddress: '0x03Cbb007066F4985cA9d7D5d7F2C42052d18503F',

  // these variables are needed for post deployment scripts to interact with the contract
  // change these variables to interact with the right contract
  tokenAddress: '0x0493CC3eB435EfcAeb2725682591F4d035BE33B8',
  crowdsaleAddress: '0x778f09D901C362A620eCff53B40C7D81c489A718',
  timelockAddress: '0x03Cbb007066F4985cA9d7D5d7F2C42052d18503F',
}
