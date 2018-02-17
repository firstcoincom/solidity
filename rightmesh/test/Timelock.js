const Timelock = artifacts.require("Timelock");
const MeshToken = artifacts.require("MeshToken");

contract('Timelock', (accounts) => {
  const owner = accounts[0];
  const nonOwner = accounts[1];

  const getCurrentTime = () => Math.floor(Date.now() / 1000);

  const getContracts = (startTime, cliffDuration, cliffReleasePercentage, gradualDuration, gradualReleasePercentage) => {
    startTime = startTime || getCurrentTime() + 2;
    cliffDuration = cliffDuration || 10;
    cliffReleasePercentage = cliffReleasePercentage || 10;
    gradualDuration = gradualDuration || 10;
    gradualReleasePercentage = gradualReleasePercentage || 70;

    return MeshToken.new().then(meshToken => {
      return Timelock.new(meshToken.address, startTime, cliffDuration, cliffReleasePercentage, gradualDuration, gradualReleasePercentage).then(timelock => {
        return ({
          timelock,
          meshToken,
        });
      });
    });
  }

  describe('constructor', () => {
    /**
     * Scenario:
     * 1. Constructor should set the arguments correctly.
     */
    it('should set the values correctly', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        Promise.all([
          timelock.cliffDuration(),
          timelock.cliffReleasePercentage(),
          timelock.gradualDuration(),
          timelock.gradualReleasePercentage(),
        ]).then(results => {
          assert.equal(results[0], 10, 'should set cliffDuration correctly');
          assert.equal(results[1], 10, 'should set cliffReleasePercentage correctly');
          assert.equal(results[2], 10, 'should set gradualDuration correctly');
          assert.equal(results[3], 70, 'should set gradualReleasePercentage correctly');
        });
      });
    });

    /**
     * Scenario:
     * 1. Constructor should validate the startTime to be in future
     */
    it('should validate startTime to be future', () => {
      return getContracts(getCurrentTime() - 1).then(({ timelock, meshToken }) => {
        throw 'validation not working correctly'
      }).catch(err => {
        assert.notEqual(err, 'validation not working correctly', 'Contract deployment should fail');
      });
    });

    /**
     * Scenario:
     * 1. Constructor should validate the total percentage of amount being released to be less than or equal to 100
     */
    it('should validate cliffReleasePercentage + gradualReleasePercentage to be less than 100', () => {
      return getContracts(null, null, 60, null, 60).then(({ timelock, meshToken }) => {
        throw 'validation not working correctly'
      }).catch(err => {
        assert.notEqual(err, 'validation not working correctly', 'Contract deployment should fail');
      });
    });
  });

  describe('withdrawalPaused', () => {
    /**
     * Scenario:
     * 1. By default withdrawls are not paused fror anyone.
     */
    it('should be false by default', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.withdrawalPaused(accounts[0]).then(paused => {
          assert.equal(paused, false, "Should not be paused default");
        });
      });
    });
  });

  describe('pauseWithdrawal',  () => {
    /**
     * Scenario:
     * 1. Owner calls pauseWithdrawal for an address
     * 2. Owner is successfully able to call pause withdrawls
     */
    it('should allow owner to pause withdraws', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.pauseWithdrawal(accounts[0]).then(() => {
          return timelock.withdrawalPaused(accounts[0]).then(paused => {
            assert.equal(paused, true, "Should be paused by now");
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Non-Owner calls pauseWithdrawal for an address
     * 2. It should do nothing.
     */
    it('should not allow non-owner to pause withdraws', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.pauseWithdrawal(accounts[0], { from: nonOwner }).then(() => {
          return timelock.withdrawalPaused(accounts[0]).then(paused => {
            assert.equal(paused, false, "Should not be paused");
          });
        });
      });
    });
  });

  describe('unpauseWithdrawal',  () => {
    /**
     * Scenario:
     * 1. Owner calls pauseWithdrawal for an address
     * 2. Owner calls unpauseWithdrawal for the same address in future
     * 3. Withdrawls are not paused anymore for that address.
     */
    it('should allow owner to unpause withdraws', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.pauseWithdrawal(accounts[0]).then(() => {
          return timelock.unpauseWithdrawal(accounts[0]).then(() => {
            return timelock.withdrawalPaused(accounts[0]).then(paused => {
              assert.equal(paused, false, "Should be unpaused by now");
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Owner calls pauseWithdrawal for an address
     * 2. Non-Owner calls unpauseWithdrawal for the same address in future
     * 3. Withdrawls should still be paused for that address.
     */
    it('should not allow non-owner to unpause withdraws', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.pauseWithdrawal(accounts[0]).then(() => {
          return timelock.unpauseWithdrawal(accounts[0], { from: nonOwner }).then(() => {
            return timelock.withdrawalPaused(accounts[0]).then(paused => {
              assert.equal(paused, true, "Should still be be paused");
            });
          });
        });
      });
    });
  });
});
