const generalSettings = require('../config/general-settings');
const crowdsaleConfig = require('../config/crowdsale-config');
const tokenConfig = require('../config/token-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// instantiate by address
var TokenInstance = utils.getTokenContract(
  web3,
  tokenConfig.tokenAddress
);

// white list a given accounts
TokenInstance.transferOwnership(
  crowdsaleConfig.crowdsaleAddress,
  {
    gas: tokenConfig.gas,
    from: tokenConfig.ownerAccount
  }
);
