var MeshToken = artifacts.require("./MeshToken.sol");
var MeshCrowdsale = artifacts.require("./MeshCrowdsale.sol");

const crowdsaleCap = 10000;
const wieToTokenRate = 100;
const wallet = '0x08325b097057E3C8A354Cccbd3b4bEF94665e734';
const startTime = Math.floor(Date.now() / 1000);
const endTime = startTime + 1000000;

module.exports = deployer => {
  return deployer.deploy(MeshToken).then(() => {
    return deployer.deploy(MeshCrowdsale, startTime, endTime, wieToTokenRate, wallet, crowdsaleCap, MeshToken.address);
  });
};
