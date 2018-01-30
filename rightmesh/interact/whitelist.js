const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require("fs");

// Crowdsale Contract Properties
const contractJSON = "build/contracts/MeshCrowdsale.json";
const contractAddress = "0x0E32C1A5C1F8873f67eAE883fF8D228A713D5C72";
const rate = 100;
const ownerAccount = "0xa30109d16db929bb45e08db7127d92a5f5114472";

// Contributor Properties
const contributorAccount = "0x4858e6E0991C3eb852D0e3c10E9Ce1ed4aB88BFc";
const limitByEth = 2;

// Get ABI interface from json file
var contents = fs.readFileSync(contractJSON);
var jsonContent = JSON.parse(contents);
var MeshCrowdsaleContract = web3.eth.contract(jsonContent.abi);

// instantiate by address
var contractInstance = MeshCrowdsaleContract.at(contractAddress);

// white list a given account 
contractInstance.setLimit(contributorAccount, web3.toWei( rate * limitByEth, 'ether'), {gas: 92000, from: ownerAccount});

