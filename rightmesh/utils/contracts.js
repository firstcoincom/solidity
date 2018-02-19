const fs = require("fs");

const getJson = file => {
  const contents = fs.readFileSync(file);
  return JSON.parse(contents);
}

const crowdsaleJsonFile = '../build/contracts/MeshCrowdsale.json';
const tokenJsonFile = '../build/contracts/MeshToken.json';
const timelockJsonFile = '../build/contracts/Timelock.json';

const getCrowdsaleABI = () => {
  return getJson(crowdsaleJsonFile).abi;
}

const getCrowdsaleBytecode = () => {
  return getJson(crowdsaleJsonFile).bytecode;
}


const getTokenABI = () => {
  return getJson(tokenJsonFile).abi;
}

const getTokenBytecode= () => {
  return getJson(tokenJsonFile).bytecode;
}

const getTimelockABI = () => {
  return getJson(timelockJsonFile).abi;
}

const getTimelockBytecode = () => {
  return getJson(timelockJsonFile).bytecode;
}


module.exports = {
  getCrowdsaleABI,
  getCrowdsaleBytecode,
  getTokenABI,
  getTokenBytecode,
  getTimelockABI,
  getTimelockBytecode,
}
