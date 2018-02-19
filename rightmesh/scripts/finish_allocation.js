const generalSettings = require('../config/general-settings');
const addressConfig = require('../config/address-config.js');
const gasConfig = require('../config/gas-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// instantiate timelock by timelock contract address
var TimelockInstance = utils.getTimelockContract(
  web3,
  addressConfig.crowdsaleAddress
);

// finish token allocation in timelock contract
TimelockInstance.finishAllocation(
  {
    gas: gasConfig.methodGas,
    from: addressConfig.ownerAddress,
  }
);
