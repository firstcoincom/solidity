const generalSettings = require('../config/general-settings');
const crowdsaleConfig = require('../config/crowdsale-config');
const whitelistConfig = require('../config/whitelist-config');
const addressConfig = require('../config/address-config.js');
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
    gas: whitelistConfig.gas,
    from: crowdsaleConfig.ownerAccount
  }
);
