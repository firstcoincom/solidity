const generalSettings = require('../config/general-settings');
const timelockConfig = require('../config/timelock-config');
const addressConfig = require('../config/address-config.js');
const gasConfig = require('../config/gas-config');
const contracts = require('../utils/contracts');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Get crowdsale contract ABI and Bytecode
var timelockABI = contracts.getTimelockABI();
var timelockBytecode = contracts.getTimelockBytecode();

// Deploy crowdsale contract
var TimelockContract = web3.eth.contract(timelockABI);

var TimelockInstance = TimelockContract.new(
  addressConfig.tokenAddress,
  timelockConfig.startTime,
  timelockConfig.cliffDuration,
  timelockConfig.cliffReleasePercentage,
  timelockConfig.slopeDuration,
  timelockConfig.slopeReleasePercentage,
  {
    data: timelockBytecode,
    from: addressConfig.ownerAddress,
    gas: gasConfig.deployGas,
  }
);


console.log("Timelock Contract is creating at: " + TimelockInstance.transactionHash);
