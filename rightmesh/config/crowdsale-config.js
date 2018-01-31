const utils = require('../utils/utils');
const addressConfig = require('./address-config');

const startTime = utils.latestTime() + utils.duration.minutes(5);

module.exports = {
  // crowdsale constructor variables
  crowdsaleCap: 1,
  rate: 100,
  wallet: addressConfig.ethWalletAddress,
  startTime: startTime,
  endTime: startTime + utils.duration.weeks(1),
}
