const generalSettings = require('../config/general-settings');
const tokenConfig = require('../config/token-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Instantiate token by token contract address
var TokenInstance = utils.getTokenContract(
  web3,
  tokenConfig.tokenAddress
);

// Call pause on the token contract
TokenInstance.pause(
  {
    gas: tokenConfig.gas,
    from: tokenConfig.ownerAccount
  }
);
