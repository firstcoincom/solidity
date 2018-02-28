const generalSettings = require('../config/general-settings');
const addressConfig = require('../config/address-config');
const allocationConfig = require('../config/allocation-config');
const gasConfig = require('../config/gas-config');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Instantiate token by token contract address
var TimelockContractInstance = utils.getTimelockContract(
  web3,
  addressConfig.timelockAddress
);

allocationConfig.forEach(a => {
  const address = a.address;
  const tokenAmountWei = utils.convertEthToWei(a.tokenAmountETH);
  const txHash = TimelockContractInstance.allocateTokens(
    address,
    tokenAmountWei,
    {
      from: addressConfig.ownerAddress,
      gas: gasConfig.methodGas,
    }
  );
  console.log(`${tokenAmountWei} tokens allocated for ${address} in ${txHash}`)
});
