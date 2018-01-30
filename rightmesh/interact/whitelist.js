const config = require('./config');
const whitelistConfig = require('./whitelist-config');
const utils = require('./utils');

const web3 = utils.getWeb3(config.rpcHost);

// instantiate by address
var crowdsaleInstance = utils.getCrowdsaleContract(
  web3,
  config.crowdsaleAddress
);

// white list a given accounts
crowdsaleInstance.setLimit(
  whitelistConfig.accountsToWhitelist,
  web3.toWei( whitelistConfig.limitByEth, 'ether'),
  {
    gas: whitelistConfig.gas,
    from: config.ownerAccount
  }
);
