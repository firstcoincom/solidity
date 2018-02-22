const generalSettings = require('../config/general-settings');
const addressConfig = require('../config/address-config');
const gasConfig = require('../config/gas-config');
const utils = require('../utils/utils');
const crowdsaleConfig = require('../config/crowdsale-config');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Instantiate crowdsale by crowdsale contract address
var CrowdsaleInstance = utils.getCrowdsaleContract(
  web3,
  addressConfig.crowdsaleAddress
);

CrowdsaleInstance.setCap(
  utils.convertEthToWei(crowdsaleConfig.crowdsaleCap),
  {
    from: addressConfig.ownerAddress,
    gas: gasConfig.methodGas,
  }
)
