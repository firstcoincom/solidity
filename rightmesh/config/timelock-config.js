const utils = require('../utils/utils');
const timeklockConfig = require('./timelock-config');

const startTime = utils.latestTime() + utils.duration.minutes(5);

module.exports = {
  startTime: startTime,
  cliffDuration :10 ,
  cliffReleasePercentage: 10,
  gradualDuration: 10,
  gradualReleasePercentage: 70,
}

