const utils = require('../utils/utils');

const startTime = utils.latestTime() + utils.duration.minutes(2);
module.exports = {
  // crowdsale constructor variables
  crowdsaleCap: 1,
  rate: 100,
  wallet: '0x08325b097057E3C8A354Cccbd3b4bEF94665e734',
  startTime: startTime,
  endTime: startTime + utils.duration.weeks(1),

  // account from geth that is being used for deployment
  // this account will also be the owner of crowdsale and eventually token contract
  ownerAccount: '0xa30109d16db929bb45e08db7127d92a5f5114472',

  // these variables are needed for post deployment scripts to interact with the contract
  // change these variables to interact with the right contract
  crowdsaleAddress: '0x0E32C1A5C1F8873f67eAE883fF8D228A713D5C72',
}
