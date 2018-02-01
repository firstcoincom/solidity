const utils = require('../utils/utils');
const addressConfig = require('./address-config');

const startTime = utils.latestTime() + utils.duration.minutes(5);

module.exports = {
  // crowdsale constructor variables
  crowdsaleCap: 1, // the cap of ether for the crowdsale
  rate: 100, // how many token will be minted for 1 eth during crowdsale
  
  startTime: startTime,
  endTime: startTime + utils.duration.weeks(1),
}
