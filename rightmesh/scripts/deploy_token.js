const generalSettings = require('../config/general-settings');
const tokenConfig = require('../config/token-config');
const contracts = require('../utils/contracts');
const utils = require('../utils/utils');

const web3 = utils.getWeb3(generalSettings.rpcHost);

// Get token contract ABI and Bytecode
var tokenABI = contracts.getTokenABI();
var tokenBytecode = contracts.getTokenBytecode();

// Deploy token contract
var TokenContract = web3.eth.contract(tokenABI);
var TokenInstance = TokenContract.new({data: tokenBytecode, from: tokenConfig.ownerAccount, gas: 4000000});

console.log("Token Contract is creating at: " + TokenInstance.transactionHash);
