const generalSettings = require('../config/general-settings');
const addressConfig = require('../config/address-config');
const mintingConfig = require('../config/minting-config');
const tokenConfig = require('../config/token-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Instantiate token by token contract address
var TokenInstance = utils.getTokenContract(
  web3,
  addressConfig.tokenAddress
);

const mint = index => {
  const address = mintingConfig[index].address;
  const tokenAmountWei = utils.convertEthToWei(mintingConfig[index].tokenAmountETH);
  TokenInstance.mint(
    address,
    tokenAmountWei,
    {
      from: tokenConfig.ownerAccount,
      gas: tokenConfig.gas,
    }
  ).then(() => {
    console.log(`${tokenAmount} tokens minted for ${address}`);
    // recursively keep calling untill all tokens are minted
    if (mintingConfig[index + 1]) {
        mint(index + 1);
    }
  });
}

mint(0);
