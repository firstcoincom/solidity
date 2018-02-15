const generalSettings = require('../config/general-settings');
const addressConfig = require('../config/address-config');
const gasConfig = require('../config/gas-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// instantiate crowdsale by crowdsale contract address
var CrowdsaleInstance = utils.getCrowdsaleContract(
  web3,
  addressConfig.crowdsaleAddress
);

CrowdsaleInstance.transferOwnership(
  addressConfig.newOwnerAddress,
  {
    gas: gasConfig.methodGas,
    from: addressConfig.ownerAddress,
  }
);
