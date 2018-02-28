const generalSettings = require('../config/general-settings');
const addressConfig = require('../config/address-config');
const whitelistConfig = require('../config/whitelist-config');
const gasConfig = require('../config/gas-config');

const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// instantiate by address
var crowdsaleInstance = utils.getCrowdsaleContract(
  web3,
  addressConfig.crowdsaleAddress
);

// white list a given accounts
crowdsaleInstance.setLimit(
  whitelistConfig.accountsToWhitelist,
  web3.toWei( whitelistConfig.limitByEth, 'ether'),
  {
    gas: gasConfig.methodGas,
    from: addressConfig.whitelistAgentAddress,
  }
);
