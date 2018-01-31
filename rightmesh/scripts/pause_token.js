const generalSettings = require('../config/general-settings');
const tokenConfig = require('../config/token-config');
const addressConfig = require('../config/address-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Instantiate token by token contract address
var TokenInstance = utils.getTokenContract(
  web3,
  addressConfig.tokenAddress
);

// Call pause on the token contract
TokenInstance.pause(
  {
    gas: tokenConfig.gas,
    from: tokenConfig.ownerAccount
  }
);
