const Timelock = artifacts.require("Timelock");
const MeshToken = artifacts.require("MeshToken");

contract('Timelock', (accounts) => {
  const owner = accounts[0];
  const nonOwner = accounts[1];

  const getCurrentTime = () => Math.floor(Date.now() / 1000);

  const getContracts = () => {
    const startTime = getCurrentTime() + 2;
    const cliffDuration = 10;
    const cliffReleasePercentage = 10;
    const gradualDuration = 10;
    const gradualReleasePercentage = 70;

    return MeshToken.new().then(meshToken => {
      return Timelock.new(meshToken.address, startTime, cliffDuration, cliffReleasePercentage, gradualDuration, gradualReleasePercentage).then(timelock => {
        return ({
          timelock,
          meshToken,
        });
      });
    });
  }

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
