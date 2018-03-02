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

const limit = web3.toWei( whitelistConfig.limitByEth, 'ether');
var failed = 0;
console.log("Expected limit: " + limit);

for (var i = 0, len = whitelistConfig.accountsToWhitelist.length; i < len; i++) {
  process.stdout.write(".");
  if(crowdsaleInstance.weiLimits(whitelistConfig.accountsToWhitelist[i]) != limit) {
    console.log(whitelistConfig.accountsToWhitelist[i] 
		+ " limit: " 
		+ crowdsaleInstance.weiLimits(whitelistConfig.accountsToWhitelist[i]));
		failed = 1;
  }
}

console.log("");

if (failed) {
  console.log("Failed.");
} 
else {
  console.log("Success.");
}


