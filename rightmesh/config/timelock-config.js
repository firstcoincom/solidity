const utils = require('../utils/utils');
const timeklockConfig = require('./timelock-config');

const cliffDuration = 10; // days from start to cliff
const slopeDuration = 100; // days from cliff to residue

module.exports = {
  startTime: 1519091061,
  cliffDuration : utils.duration.days(cliffDuration) ,
  cliffReleasePercentage: 10,
  slopeDuration: utils.duration.days(slopeDuration),
  slopeReleasePercentage: 70,
}

