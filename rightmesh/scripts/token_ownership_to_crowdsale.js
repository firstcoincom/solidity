const generalSettings = require('../config/general-settings');
const crowdsaleConfig = require('../config/crowdsale-config');
const tokenConfig = require('../config/token-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Instantiate token by token contract address
var TokenInstance = utils.getTokenContract(
  web3,
  tokenConfig.tokenAddress
);

// Transfer token contract ownership to crowdsale contract 
TokenInstance.transferOwnership(
  crowdsaleConfig.crowdsaleAddress,
  {
    gas: tokenConfig.gas,
    from: tokenConfig.ownerAccount
  }
);
