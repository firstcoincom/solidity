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
        return Promise.all([
          meshToken.unpause(),
          meshToken.mint(timelock.address, 1000000)
        ]).then(() => {
          return {
            timelock,
            meshToken,
          };
        })
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
          timelock.allocationFinished()
        ]).then(results => {
          assert.equal(results[0], 10, 'should set cliffDuration correctly');
          assert.equal(results[1], 10, 'should set cliffReleasePercentage correctly');
          assert.equal(results[2], 10, 'should set gradualDuration correctly');
          assert.equal(results[3], 70, 'should set gradualReleasePercentage correctly');
          assert.equal(results[4], false, 'allocationFinished should be set to false by default');
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

  describe('finishAllocation', () => {
    /**
     * Scenario:
     * 1. Owner calls finishAllocation once all the allocation has been done.
     * 2. Owner successfully able to set allocationFinished to true.
     */
    it('should allow owner to finishAllocation', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.finishAllocation().then(() => {
          timelock.allocationFinished().then(allocationFinished => {
            assert.equal(allocationFinished, true, 'should be set to true by now');
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Non-Owner calls finishAllocation
     * 2. Non-Owner unable able to set allocationFinished to true.
     */
    it('should not allow non-owner to finishAllocation', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.finishAllocation({ from: nonOwner }).then(() => {
          timelock.allocationFinished().then(allocationFinished => {
            assert.equal(allocationFinished, false, 'should still be set to false by now');
          });
        });
      });
    });
  });

  describe('allocatedTokens', () => {
    /**
     * Scenario:
     * 1. As soon as timelock is deployed, by default there should be no allocations.
     */
    it('should be set to 0 by default for any address', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.allocatedTokens(nonOwner).then(amount => {
          assert.equal(0, amount, 'default allocatedTokens for any address should be 0');
        });
      });
    });
  });

  describe('withdrawnTokens', () => {
    /**
     * Scenario:
     * 1. As soon as timelock is deployed, by default there should be no withdrawnTokens set
     */
    it('should be set to 0 by default for any address', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.withdrawnTokens(nonOwner).then(amount => {
          assert.equal(0, amount, 'default withdrawnTokens for any address should be 0');
        });
      });
    });
  });

  describe('allocateTokens', () => {
    /**
     * Scenario:
     * 1. Owner calls allocateTokens to assign tokens to an address.
     * 2. Owner successfully able to allocate tokens.
     */
    it('should allow owner to allocate tokens if allocationFinished is set to false', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100).then(() => {
          return timelock.allocatedTokens(nonOwner).then(amount => {
            assert.equal(amount, 100, 'allocateTokens should be set to 100 by now');
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Owner calls allocateTokens to assign tokens to an address.
     * 2. Owner successfully able to allocate tokens.
     * 3. Owner calls allocateTokens for the same address with updated amount.
     * 4. Owner successfully able to change allocated tokens.
     */
    it('should allow onwer to change allocated tokens if allocationFinished is set to false', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100).then(() => {
          return timelock.allocateTokens(nonOwner, 50).then(() => {
            return timelock.allocatedTokens(nonOwner).then(amount => {
              assert.equal(amount, 50, 'allocateTokens should be set to 50 by now');
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Non-Owner calls allocateTokens to assign tokens to an address.
     * 2. Non-Owner unable to allocate tokens.
     */
    it('should not allow non-owner to allocate tokens', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100, { from: nonOwner }).then(() => {
          return timelock.allocatedTokens(nonOwner).then(amount => {
            assert.equal(amount, 0, 'allocateTokens should still be set to 0 by now');
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Owner calls finishAllocation once all the token allocation is done.
     * 2. Owner calls allocateTokens to change the allocateTokens for an address.
     * 3. Owner unable to change the allocatedTokens.
     */
    it('should not allow owner to allocate tokens it allocationFinished is set to true', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.finishAllocation().then(() => {
          return timelock.allocateTokens(nonOwner, 100).then(() => {
            return timelock.allocatedTokens(nonOwner).then(amount => {
              assert.equal(amount, 0, 'allocateTokens should still be set to 0 by now');
            });
          });
        });
      });
    });
  });

  describe('availableForWithdrawal', () => {
    /**
     * Scenario:
     * 1. Owner allocates certain amount of tokens to an address.
     * 2. Anyone trying to see available tokens for withdrawal before cliffDuration is reached.
     * 3. 0 tokens should be available for withdrawal.
     */
    it('should be 0 before cliffDuration is reached', () => {
      return getContracts().then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100).then(() => {
          return timelock.availableForWithdrawal(nonOwner).then(amount => {
            assert.equal(amount, 0, 'Amount available for withdraw before cliffDuration should be 0');
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Owner allocates certain amount of tokens to an address.
     * 2. Anyone trying to see available tokens for withdrawal after the locking period is finished.
     * 3. All tokens should be available for withdrawal.
     */
    it('should be equal to maximum after cliffDuration + gradualDuration is reached', () => {
      const startDelay = 2;
      const startTime = getCurrentTime() + startDelay;
      const cliffDuration = 1;
      const gradualDuration = 1;

      return getContracts(startTime, cliffDuration, null, gradualDuration, null).then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100).then(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              timelock.availableForWithdrawal(nonOwner).then(amount => {
                assert.equal(amount, 100, 'Entire amount should be available for withdrawal by the end of vesting period');
                resolve('');
              });
            }, (startDelay + cliffDuration + gradualDuration + 1) * 1000);
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Owner allocates certain amount of tokens to an address
     * 2. Anyone trying to see available tokens for withdrawal between cliffDuration and timelock ending
     * 3. Atleast cliffReleasePercentage of allocatedTokens amount of tokens should be available for withdrawal.
     */
    it('should be greater than cliffReleasePercentage between cliffDuration and gradualDuration', () => {
      const startDelay = 2;
      const startTime = getCurrentTime() + startDelay;
      const cliffDuration = 1;
      const cliffReleasePercentage = 10;
      const gradualDuration = 5;
      const gradualReleasePercentage = 50;
      const allocatedTokens = 100;

      return getContracts(startTime, cliffDuration, cliffReleasePercentage, gradualDuration, gradualReleasePercentage).then(({ meshToken, timelock}) => {
        return timelock.allocateTokens(nonOwner, allocatedTokens).then(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              timelock.availableForWithdrawal(nonOwner).then(amount => {
                assert.isTrue(amount >= (cliffReleasePercentage * allocatedTokens) / 100, 'Available amoung should be greater than 10% of 100 = 10');
                resolve('');
              });
            }, (startDelay + cliffDuration + 2) * 1000);
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Owner allocates certain amount of tokens to an address
     * 2. Anyone trying to see available tokens for withdrawal between cliffDuration and timelock ending
     * 3. Atmax allocatedTokens amount of tokens should be available for withdrawal.
     */
    it('should be less than total allocateTokens between cliffDuration and gradualDuration', () => {
      const startDelay = 2;
      const startTime = getCurrentTime() + startDelay;
      const cliffDuration = 1;
      const cliffReleasePercentage = 10;
      const gradualDuration = 5;
      const gradualReleasePercentage = 50;
      const allocatedTokens = 100;

      return getContracts(startTime, cliffDuration, cliffReleasePercentage, gradualDuration, gradualReleasePercentage).then(({ meshToken, timelock}) => {
        return timelock.allocateTokens(nonOwner, allocatedTokens).then(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              timelock.availableForWithdrawal(nonOwner).then(amount => {
                assert.isTrue(amount <= allocatedTokens, 'Available amount should be less than total allocatedTokens');
                resolve('');
              });
            }, (startDelay + cliffDuration + 4) * 1000);
          });
        });
      });
    });
  });

  describe('withdraw', () => {

    /**
     * Scenario:
     * 1. Owner allocates certain amount of tokens to an address
     * 2. User trying to withdraw tokens before the cliffDuration has been reached.
     * 3. User should not be able to withdraw anything.
     */
    it('should not allow message sender to withdraw anything before cliffDuration has been reached', () => {
      const startDelay = 2;
      const startTime = getCurrentTime() + startDelay;
      const cliffDuration = 1;
      const gradualDuration = 1;

      return getContracts(startTime, cliffDuration, null, gradualDuration, null).then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100).then(() => {
          return timelock.withdraw({ from: nonOwner }).then(() => {
            return Promise.all([
              timelock.withdrawnTokens(nonOwner),
              meshToken.balanceOf(nonOwner),
            ]).then(results => {
              const withdrawnTokens = results[0];
              const nonOwnerBalance = results[1];
              assert.equal(withdrawnTokens, 0, 'no tokens should be withdrawn by now');
              assert.equal(nonOwnerBalance, 0, 'owner should still not have received any tokens');
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Owner allocates certain amount of tokens to an address
     * 2. User trying to withdraw tokens.
     * 3. User should be able to withdraw whatever has been unlocked.
     */
    it('should allow message sender to withdraw availableTokens and set withdrawnTokens accrdngly', () => {
      const startDelay = 2;
      const startTime = getCurrentTime() + startDelay;
      const cliffDuration = 1;
      const gradualDuration = 1;

      return getContracts(startTime, cliffDuration, null, gradualDuration, null).then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100).then(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              timelock.withdraw({ from: nonOwner }).then(() => {
                Promise.all([
                  timelock.withdrawnTokens(nonOwner),
                  meshToken.balanceOf(nonOwner),
                ]).then(results => {
                  const withdrawnTokens = results[0];
                  const nonOwnerBalance = results[1];
                  assert.equal(withdrawnTokens, 100, 'withdrawnTokens should be set to 100 by now');
                  assert.equal(nonOwnerBalance, 100, 'nonOwnerBalance should be set to 100 by now');
                  resolve('');
                });
              });
            }, (startDelay + cliffDuration + gradualDuration + 1) * 1000);
          });
        });
      });
    });


    /**
     * Scenario:
     * 1. Owner allocates certain amount of tokens to an address
     * 2. Owner called pause on withdrawlas for that address.
     * 2. User trying to withdraw tokens.
     * 3. User should not be able to withdraw whatever has been unlocked.
     */
    it('should not allow message sender to withdraw availableTokens is withdrawlas are paused even if there are unlocked tokens', () => {
      const startDelay = 2;
      const startTime = getCurrentTime() + startDelay;
      const cliffDuration = 1;
      const gradualDuration = 1;

      return getContracts(startTime, cliffDuration, null, gradualDuration, null).then(({ meshToken, timelock }) => {
        return timelock.allocateTokens(nonOwner, 100).then(() => {
          return timelock.pauseWithdrawal(nonOwner).then(() => {
            return new Promise(resolve => {
              setTimeout(() => {
                timelock.withdraw({ from: nonOwner }).then(() => {
                  Promise.all([
                    timelock.withdrawnTokens(nonOwner),
                    meshToken.balanceOf(nonOwner),
                  ]).then(results => {
                    const withdrawnTokens = results[0];
                    const nonOwnerBalance = results[1];
                    assert.equal(withdrawnTokens, 0, 'no tokens should be withdrawn by now');
                    assert.equal(nonOwnerBalance, 0, 'owner should still not have received any tokens');
                    resolve('');
                  });
                });
              }, (startDelay + cliffDuration + gradualDuration + 1) * 1000);
            });
          });
        });
      });
    });
  });
});
