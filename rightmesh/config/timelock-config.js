const utils = require('../utils/utils');
const timeklockConfig = require('./timelock-config');

const cliffDurationDays = 180; // days from start to cliff
const slopeDurationDays = 540; // days from cliff to residue

module.exports = {
  startTime: 1519339559,
  cliffDuration : utils.duration.days(cliffDurationDays),
  cliffReleasePercentage: 10,
  slopeDuration: utils.duration.days(slopeDurationDays),
  slopeReleasePercentage: 90,
}

