var MeshToken = artifacts.require("./MeshToken.sol");
var MeshCrowdsale = artifacts.require("./MeshCrowdsale.sol");

function latestTime() {
  // truffle version 4.0.x still depends on web3 version 0.2x.x
  // please refer to https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgetblock
  // for web 3 documentation
  return web3.eth.getBlock('latest').timestamp;
}

const duration = {
  seconds: function (val) { return val },
  minutes: function (val) { return val * this.seconds(60) },
  hours: function (val) { return val * this.minutes(60) },
  days: function (val) { return val * this.hours(24) },
  weeks: function (val) { return val * this.days(7) },
  years: function (val) { return val * this.days(365) }
};

function convertEthToWei(n) {
  // TODO: move this function to a utility module, if there are any other functions which need a home.
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

const crowdsaleCap = 2; // the cap of the total amount of ether which allows investoer to contribute
const rate = 100;
const wallet = '0x08325b097057E3C8A354Cccbd3b4bEF94665e734';
const startTime = latestTime() + duration.minutes(2);
const endTime = startTime + duration.weeks(1);

console.log([startTime, endTime]);

module.exports = deployer => {
  return deployer.deploy(MeshToken).then(() => {
    return deployer.deploy(MeshCrowdsale, startTime, endTime, rate, wallet, convertEthToWei(crowdsaleCap), MeshToken.address).then(() => {
      const tokenInstance = MeshToken.at(MeshToken.address);
      return tokenInstance.pause().then(() => {
        return tokenInstance.transferOwnership(MeshCrowdsale.address);
      });
    });
  });
};
