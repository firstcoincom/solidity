var MeshToken = artifacts.require("./MeshToken.sol");
var MeshCrowdsale = artifacts.require("./MeshCrowdsale.sol");

const config = require('../interact/config');
const utils = require('../interact/utils');

module.exports = deployer => {
  return deployer.deploy(MeshToken).then(() => {
    return deployer.deploy(MeshCrowdsale, config.startTime, config.endTime, config.rate, config.wallet, utils.convertEthToWei(config.crowdsaleCap), MeshToken.address).then(() => {
      const tokenInstance = MeshToken.at(MeshToken.address);
      return tokenInstance.pause().then(() => {
        return tokenInstance.transferOwnership(MeshCrowdsale.address);
      });
    });
  });
};
