const generalSettings = require('../config/general-settings');
const crowdsaleConfig = require('../config/crowdsale-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// instantiate crowdsale by crowdsale contract address
var CrowdsaleInstance = utils.getCrowdsaleContract(
  web3,
  crowdsaleConfig.crowdsaleAddress
);

// transfer token contract ownership back to owner 
CrowdsaleInstance.transferTokenOwnership(
  {
    gas: crowdsaleConfig.gas,
    from: crowdsaleConfig.ownerAccount
  }
);

