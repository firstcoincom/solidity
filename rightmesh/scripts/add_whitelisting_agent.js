const generalSettings = require('../config/general-settings');
const crowdsaleConfig = require('../config/crowdsale-config');
const addressConfig = require('../config/address-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Instantiate crowdsale by crowdsale contract address
var CrowdsaleInstance = utils.getCrowdsaleContract(
  web3,
  addressConfig.crowdsaleAddress
);

CrowdsaleInstance.setWhitelistingAgent(
  addressConfig.whitelistAgentAddress,
  true,
  {
    from: crowdsaleConfig.ownerAccount,
    gas: crowdsaleConfig.gas,
  }
)
