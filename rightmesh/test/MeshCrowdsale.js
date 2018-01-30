const MeshCrowdsale = artifacts.require("MeshCrowdsale");
const MeshToken = artifacts.require("MeshToken");

contract('MeshCrowdsale', (accounts) => {
  const rate = 100;
  const wallet = accounts[0];
  const crowdsaleCap = 10000;

  const addr1 = accounts[1];
  const contributionLimit = 100;
  const contributionAmount = contributionLimit / 2;

  const getCurrentTime = () => Math.floor(Date.now() / 1000);

  const getContracts = (startTime, endTime) => {
    /**
     * Contract deployment order:
     * 1. Deploy token contract first.
     * 2. then deploy crowdsale contract.
     * 3. Transfer ownership of token contract to crowdsale contract.
     */
    return MeshToken.new().then(meshToken => {
      const deployCrowdsale = () => {
        startTime = startTime || getCurrentTime();
        endTime = endTime || (startTime + 10000000);
        return MeshCrowdsale.new(startTime, endTime, rate, wallet, crowdsaleCap, meshToken.address);
      };
      // when deploying contract, we are setting startTime equal to current time
      // occassionally time second flips before next deploy, therefore setting out start time in past
      // that will fail deploy as crowdsale constructor requires startTiem to be in past or future
      // catching the failure and redeploying it fixes the issue.
      return deployCrowdsale().catch(deployCrowdsale).then(meshCrowdsale => {
        return meshToken.transferOwnership(meshCrowdsale.address).then(() => {
          return { meshCrowdsale, meshToken, startTime, endTime };
        });
      });
    });
  }

  describe('constructor', () => {
    it('should set defaults in constructor', () => {
      return getContracts().then(({ meshCrowdsale, meshToken, startTime, endTime }) => {
        return Promise.all([
          meshCrowdsale.startTime(),
          meshCrowdsale.endTime(),
          meshCrowdsale.rate(),
          meshCrowdsale.wallet(),
          meshCrowdsale.cap(),
          meshCrowdsale.token()
        ]).then(results => {
          assert.equal(results[0], startTime, "Start time should match the passed params");
          assert.equal(results[1], endTime, "End time should match the passed params");
          assert.equal(results[2], rate, "Convertion rate should match the passed params");
          assert.equal(results[3], wallet, "Destination wallet should match the passed params");
          assert.equal(results[4], crowdsaleCap, "Cap should match the passed params");
          assert.equal(results[5], meshToken.address, "Token should match the passed params");
        });
      });
    });
  });

  describe('weiLimits',  () => {
    it('should set default limit to 0', () => {
      /**
       * Scenario:
       * 1. Default limits for any address are initalized to 0.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.weiLimits(addr1).then(limit => {
          assert.equal(limit, 0, "Default contribution limit should be 0");
        });
      });
    });
  });

  describe('weiContributions', () => {
    it('should set default contribution to 0', () => {
      /**
       * Scenario:
       * 1. Default contributions for any address are initalized to 0.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.weiContributions(addr1).then(limit => {
          assert.equal(limit, 0, "Default contribution should be 0");
        });
      });
    });
  });

  describe('setRate', () => {
    /**
     * Scenario:
     * 1. Contract owner calling contract to set rate
     * 2. It should allow contract owners to change the rate.
     */
    it('should change the rate when called', () => {
      const newRate = 100000;
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setRate(newRate).then(() => {
          return meshCrowdsale.rate().then(_rate => {
            assert.equal(_rate, newRate, 'Rate should be equal to new rate now');
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Non Contract owner calling contract to set rate
     * 2. It should not allow non-contract owners to change the rate.
     */
    it('should not allow non owner to change the rate', () => {
      const newRate = 100000;
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setRate(newRate, { from: addr1 }).then(() => {
          return meshCrowdsale.rate().then(_rate => {
            assert.equal(_rate, rate, 'Rate should still be as original defined in the constructor');
          });
        });
      });
    });
  });

  describe('setWhitelistingAgent', () => {

    /**
     * Scenario:
     * 1. Onwer calls setWhitelistingAgent to whitelist an address
     * 2. Address is now marked as whitelisting agent.
     */
    it('should allow owner to set whitelisting agent to true', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.whitelistingAgents(addr1).then(value => {
            assert.equal(value, true, 'addr1 should be a whitelistingAgent by now');
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Non Onwer calls setWhitelistingAgent to whitelist an address
     * 2. Address is still not marked as whitelisting agent.
     */
    it('should not allow non-owner to add / remove whitelisting agent', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true, { from: addr1 }).then(() => {
          return meshCrowdsale.whitelistingAgents(addr1).then(value => {
            assert.equal(value, false, 'addr1 should not be a whitelistingAgent');
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Onwer calls setWhitelistingAgent to whitelist an address
     * 2. Address is now marked as whitelisting agent.
     * 3. Owner calls the contract again to remove the whitelisting agent.
     * 4. Address is now not marked as whitelisting agent.
     */
    it('should allow owner to set whitelisting agent to false', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.whitelistingAgents(addr1).then(value => {
            assert.equal(value, true, 'addr1 should be a whitelistingAgent by now');
            return meshCrowdsale.setWhitelistingAgent(addr1, false).then(() => {
              return meshCrowdsale.whitelistingAgents(addr1).then(value => {
                assert.equal(value, false, 'addr1 should not be a whitelistingAgent by now');
              });
            });
          });
        });
      });
    });
  });

  describe('setLimit',  () => {
    it('should execute successfully for 0 addresses', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Whitelisting agent to update contribution limit for 0 addresses.
       * 3. The function should execute successfully
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([], contributionLimit, { from: addr1 });
        });
      });
    });

    it('should update limit correctly for 1 address', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Whitelisting agent to update contribution limit for an address.
       * 3. Anyone being able to read weiLimits for an address.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return meshCrowdsale.weiLimits(addr1).then(limit => {
              assert.equal(limit, contributionLimit, "Contribution limit should be set to contribution limit now");
            });
          });
        });
      });
    });

    it('should update limit correctly for multiple addresses', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Whitelisting agent to update contribution limit for multiple addresses.
       * 3. Anyone being able to read weiLimits for an address.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1, wallet], contributionLimit, { from: addr1 }).then(() => {
            return Promise.all([
              meshCrowdsale.weiLimits(addr1),
              meshCrowdsale.weiLimits(wallet),
            ]).then(limits => {
              assert.equal(limits[0], contributionLimit, "Contribution limit should be set to contribution limit now");
              assert.equal(limits[1], contributionLimit, "Contribution limit should be set to contribution limit now");
            });
          });
        });
      });

      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Non-Whitelisting agent to update contribution limit for multiple addresses.
       * 3. Limits should still be 0
       */
      it('should not allow non-whitelisting agent to call setLimit', () => {
        return getContracts().then(({ meshCrowdsale, meshToken }) => {
          return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
            return meshCrowdsale.setLimit([addr1, wallet], contributionLimit, { from: wallet }).then(() => {
              return Promise.all([
                meshCrowdsale.weiLimits(addr1),
                meshCrowdsale.weiLimits(wallet),
              ]).then(limits => {
                assert.equal(limits[0], 0, "Contribution limit should still be set to 0");
                assert.equal(limits[1], 0, "Contribution limit should still be set to 0");
              });
            });
          });
        });
      });
    });
  });

  describe('transferTokenOwnership', () => {
    it('should transfer the ownership correctly from owner', () => {
      /**
       * Scenario:
       * 1. Once crowdsale is done, transfer the ownership back to contract owner address.
       * 2. Token should now be onwed by the contract owner.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.transferTokenOwnership().then(() => {
          return Promise.all([
            meshToken.owner(),
            meshCrowdsale.owner(),
          ]).then(results => {
            assert.equal(results[0], results[1], "Token owner should be updated to contract owner now");
          });
        });
      });
    });

    it('should not allow transfer the ownership correctly from non-owner', () => {
      /**
       * Scenario:
       * 1. Non-owner tries to change the ownership of token
       * 2. Token ownership transfer should fail.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.transferTokenOwnership({ from: accounts[1] }).then(() => {
          return meshToken.owner().then(owner => {
            assert.equal(owner, meshCrowdsale.address, "Token should still be owned by contract only");
          });
        });
      });
    });
  });

  describe('pauseToken', () => {
    /**
     * Scenario:
     * 1. Contract owner call pauseToken to pause token transfers
     * 2. Token transfers should be paused now.
     */
    it('should pause token when requested by owner', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.pauseToken().then(() => {
          return meshToken.paused().then(paused => {
            assert.equal(paused, true, "Token should be paused now");
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Contract owner calls pauseToken to pause token transfers
     * 2. Token transfers should be paused now
     * 3. Contract owner calls unpauseToken to unpause token transfers
     * 4. Token transfers should be unpaused now
     * 5. Contract owner calls pauseToken again to pause token transfers
     * 6. Contract owner should not be able to pause the transfers again
     */
    it('should pause token only once requested by owner', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.pauseToken().then(() => {
          return meshToken.paused().then(paused => {
            assert.equal(paused, true, "Token should be paused now");
            return meshCrowdsale.unpauseToken().then(() => {
              return meshToken.paused().then(paused => {
                assert.equal(paused, false, "Token should be unpaused now");
                return meshCrowdsale.pauseToken().then(() => {
                  return meshToken.paused().then(paused => {
                    assert.equal(paused, false, "Token should still be unpaused now");
                  });
                });
              });
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Non owner call pauseToken to pause token transfers
     * 2. Token transfers should still be unpaused.
     */
   it('should not pause token when requested by non-owner', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.pauseToken({ from: accounts[1] }).then(() => {
          return meshToken.paused().then(paused => {
            assert.equal(paused, false, "Token should be paused now");
          });
        });
      });
    });
  });

  describe('unpauseToken', () => {
    /**
     * Scenario:
     * 1. Contract owner call unpauseToken to pause token transfers
     * 2. Token transfers should be unpaused now.
     */
   it('should unpause token when requested by owner', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.pauseToken().then(() => {
          return meshCrowdsale.unpauseToken().then(() => {
            return meshToken.paused().then(paused => {
              assert.equal(paused, false, "Token should be unpaused now");
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Non owner call unpauseToken to pause token transfers
     * 2. Token transfers should still be paused.
     */
   it('should not unpause token when requested by non-owner', () => {
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.pauseToken().then(() => {
          return meshCrowdsale.pauseToken({ from: accounts[1] }).then(() => {
            return meshToken.paused().then(paused => {
              assert.equal(paused, true, "Token should still be paused now");
            });
          });
        });
      });
    });
  });

  describe('user scenarios for contribution', () => {
    it('ERROR: should not allow addresses with 0 weiLimits to contribute', () => {
      /**
       * Scenario:
       * 1. User trying to contribute just by sending ETH to contract address without getting whitelisted.
       * 2. Transaction should throw an exception
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.sendTransaction({value: 10, from: addr1}).then(() => {
          return meshToken.balanceOf(addr1).then(balance => {
            assert.equal(0, balance, "Token balance should be 0");
          });
        });
      });
    });

    it('ERROR: should not be able to buy tokens more than the limit', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Whitelisting agentto to increase the contribution limit for address
       * 3. User trying to contribute above set limits and total contribution cap is not reached yet
       * 4. Transaction should fail
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return meshCrowdsale.sendTransaction({value: contributionLimit + 1, from: addr1}).then(() => {
              return meshToken.balanceOf(addr1).then(balance => {
                assert.equal(0, balance, "Token balance should be 0");
              });
            });
          });
        });
      });
    });

    it('SUCCESS: should be able to buy tokens in limit if the total cap is not yet reached', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Whitelisting agentto to increase the contribution limit for address
       * 3. User trying to contribute within set limits and total contribution cap is not reached yet
       * 4. Transaction should succeed
       * 5. The address should have rate * contributionAmount number of tokens by now.
       * 6. wieContribution for the address should be recorded.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
              return Promise.all([
                meshCrowdsale.weiContributions(addr1),
                meshToken.balanceOf(addr1),
              ]).then(results => {
                assert.equal(results[0], contributionAmount, "weiContribution should be recorded");
                assert.equal(results[1], rate * contributionAmount, "No. of tokens should be equal to rate * contributionAmount");
              });
            });
          });
        });
      });
    });

    it('SUCCESS: should be able to buy tokens multiple times in limit if the total cap is not yet reached', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Whitelisting agentto to increase the contribution limit for address
       * 3. User trying to contribute within set limits and total contribution cap is not reached yet
       * 4. Transaction should succeed
       * 5. User trying second time to contribute within set limits and total contribution cap is not reached yet
       * 6. Transaction should succeed
       * 7. The address should have rate * contributionAmount number of tokens by now.
       * 8. wieContribution for the address should be recorded.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
              return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
                return Promise.all([
                  meshCrowdsale.weiContributions(addr1),
                  meshToken.balanceOf(addr1),
                ]).then(results => {
                  assert.equal(results[0], 2 * contributionAmount, "weiContribution should be recorded");
                  assert.equal(results[1], rate * 2 * contributionAmount, "No. of tokens should be equal to rate * 2 * contributionAmount");
                });
              });
            });
          });
        });
      });
    });

    it('ERROR: should not be able to buy tokens multiple times total contribution is outside limit even if the total cap is not yet reached', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to allow whitelisting agent
       * 2. Whitelisting agentto to increase the contribution limit for address
       * 3. User trying to contribute within set limits and total contribution cap is not reached yet
       * 4. Transaction should succeed
       * 5. User contributes again within the limits
       * 6. Transaction should succeed
       * 7. User contributes again but this time exceeds the limit
       * 8. Transaction should fail
       * 9. The address should have rate * contributionAmount number of tokens by now.
       * 10. wieContribution for the address should be recorded.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
              return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
                // this transaction should fail as user is going above the limit with 3rd contribution
                return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
                  return Promise.all([
                    meshCrowdsale.weiContributions(addr1),
                    meshToken.balanceOf(addr1),
                  ]).then(results => {
                    assert.equal(results[0], 2 * contributionAmount, "weiContribution should be recorded");
                    assert.equal(results[1], rate * 2 * contributionAmount, "No. of tokens should be equal to rate * 2 * contributionAmount");
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('startTime and endTime', () => {
    it('ERROR: should not allow contribution before start time', () => {
      /**
       * Scenario:
       * 1. Sale starts 1000000 seconds after deply.
       * 2. User trying to contribute before sale starts.
       * 3. User should not be able to contribute.
       */
      const startTime = getCurrentTime() + 100000;
      const endTime = startTime + 10000;
      const contributionDelay = 0;
      return getContracts(startTime, endTime).then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return new Promise(resolve => {
              setTimeout(() => {
                meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1})
                .then(() => {
                  meshToken.balanceOf(addr1).then(balance => {
                    assert.equal(0, balance, "Token balance should be 0");
                    resolve('');
                  });
                })
              }, contributionDelay * 1000);
            });
          });
        });
      });
    });

    it('ERROR: should not allow contribution after end time', () => {
      /**
       * Scenario:
       * 1. Sale starts immediately and ends afer 1 second.
       * 2. User trying to contribute after sale ends.
       * 3. User should not be able to contribute.
       */
      const startTime = getCurrentTime();
      const endTime = startTime + 1;
      const contributionDelay = 2;
      return getContracts(startTime, endTime).then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return new Promise(resolve => {
              setTimeout(() => {
                meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1})
                .then(() => {
                  meshToken.balanceOf(addr1).then(balance => {
                    assert.equal(0, balance, "Token balance should be 0");
                    resolve('');
                  });
                })
              }, contributionDelay * 1000);
            });
          });
        });
      });
    });

    it('SUCCESS: should not allow contribution after start time and before end time', () => {
      /**
       * Scenario:
       * 1. Sale starts immediately and ends afer 2 seconds
       * 2. User trying to contribute within the 2 seconds.
       * 3. User should be able to contribute.
       */
      const startTime = getCurrentTime();
      const endTime = startTime + 2;
      const contributionDelay = 1;
      return getContracts(startTime, endTime).then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], contributionLimit, { from: addr1 }).then(() => {
            return new Promise(resolve => {
              setTimeout(() => {
                meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1})
                .then(() => {
                  meshToken.balanceOf(addr1).then(balance => {
                    assert.equal(contributionAmount * rate, balance, "Token balance should be contributionAmount * rate");
                    resolve('');
                  });
                })
              }, contributionDelay * 1000);
            });
          });
        });
      });
    });
  });

  describe('total contribution cap', () => {
    it('ERROR: should not allow to contribute more than crowdsale cap', () => {
      /**
       * Scenario:
       * 1. Change user contribution limit more than the crowdsale cap.
       * 2. User tries to contribuite more than the crowdsale cap.
       * 3. User should not be able to contribute.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], crowdsaleCap + 100, { from: addr1 }).then(() => {
            return meshCrowdsale.sendTransaction({ value: crowdsaleCap + 100, from: addr1}).then(() => {
              return meshToken.balanceOf(addr1).then(balance => {
                assert.equal(0, balance, "Token balance should be 0");
              });
            });
          });
        });
      });
    });

    it('SUCCESS: should allow to contribute less than crowdsale cap', () => {
      /**
       * Scenario:
       * 1. Change user contribution limit less than the crowdsale cap.
       * 2. User tries to contribuite less than the crowdsale cap.
       * 3. User should be able to contribute.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], crowdsaleCap, { from: addr1 }).then(() => {
            return meshCrowdsale.sendTransaction({ value: crowdsaleCap - 1, from: addr1}).then(() => {
              return meshToken.balanceOf(addr1).then(balance => {
                assert.equal(rate * (crowdsaleCap - 1), balance, "Token balance should be rate * (crowdsaleCap - 1)");
              });
            });
          });
        });
      });
    });

    it('SUCCESS: should allow to contribute equal to crowdsale cap', () => {
      /**
       * Scenario:
       * 1. Change user contribution limit equal to the crowdsale cap.
       * 2. User tries to contribuite equal to the crowdsale cap.
       * 3. User should be able to contribute.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setWhitelistingAgent(addr1, true).then(() => {
          return meshCrowdsale.setLimit([addr1], crowdsaleCap, { from: addr1 }).then(() => {
            return meshCrowdsale.sendTransaction({ value: crowdsaleCap, from: addr1}).then(() => {
              return meshToken.balanceOf(addr1).then(balance => {
                assert.equal(rate * crowdsaleCap, balance, "Token balance should be rate * crowdsaleCap");
              });
            });
          });
        });
      });
    });
  });
});
