const generalSettings = require('../config/general-settings');
const crowdsaleConfig = require('../config/crowdsale-config');
const addressConfig = require('../config/address-config.js');
const gasConfig = require('../config/gas-config');
const contracts = require('../utils/contracts');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Get crowdsale contract ABI and Bytecode
var crowdsaleABI = contracts.getCrowdsaleABI();
var crowdsaleBytecode = contracts.getCrowdsaleBytecode();

// Deploy crowdsale contract
var CrowdsaleContract = web3.eth.contract(crowdsaleABI);
var CrowdsaleInstance = CrowdsaleContract.new(
    crowdsaleConfig.startTime,
    crowdsaleConfig.endTime,
    crowdsaleConfig.rate,
    addressConfig.ethWalletAddress,
    utils.convertEthToWei(crowdsaleConfig.crowdsaleCap),
    addressConfig.tokenAddress,
    {
        data: crowdsaleBytecode,
        from: addressConfig.ownerAddress,
       gas: gasConfig.deployGas
    });

console.log("Crowdsale Contract is creating at: " + CrowdsaleInstance.transactionHash);
