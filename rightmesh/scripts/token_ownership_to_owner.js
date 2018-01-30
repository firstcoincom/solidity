const generalSettings = require('../config/general-settings');
const crowdsaleConfig = require('../config/crowdsale-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// instantiate by address
var CrowdsaleInstance = utils.getCrowdsaleContract(
  web3,
  crowdsaleConfig.crowdsaleAddress
);

// white list a given accounts
CrowdsaleInstance.transferTokenOwnership(
  {
    gas: crowdsaleConfig.gas,
    from: crowdsaleConfig.ownerAccount
  }
);

