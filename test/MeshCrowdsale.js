const MeshCrowdsale = artifacts.require("MeshCrowdsale");
const MeshToken = artifacts.require("MeshToken");

contract('MeshCrowdsale', (accounts) => {
  const rate = 100;
  const wallet = accounts[0];
  const crowdsaleCap = 10000;
  const tokenCap = 100000000;

  const addr1 = accounts[1];
  const contributionLimit = 100;
  const contributionAmount = contributionLimit / 2;

  const getContracts = () => {
    /**
     * Contract deployment order:
     * 1. Deploy token contract.
     * 2. Deploy crowdsale contract with all the required params + token contract address.
     * 3. Transfer ownership of token contract to crowdsale contract.
     */
    return MeshToken.new(tokenCap).then(meshToken => {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 10000000;
      return MeshCrowdsale.new(startTime, endTime, rate, wallet, crowdsaleCap, meshToken.address).then(meshCrowdsale => {
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

  describe('setLimit',  () => {
    it('should update limit correctly', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to update contribution limit for an address.
       * 2. Anyone being able to read weiLimits for an address.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setLimit(addr1, contributionLimit).then(() => {
          return meshCrowdsale.weiLimits(addr1).then(limit => {
            assert.equal(limit, contributionLimit, "Contribution limit should be set to contribution limit now");
          });
        });
      });
    });
  });

  describe('transferTokenOwnership', () => {
    it('should transfer the ownership correctly', () => {
      /**
       * Scenario:
       * 1. Transfer token ownership to crowdsale for minting buyTokens.
       * 2. Once crowdsale is done, transfer the ownership back to an address for manual minting.
       * 3. Token should now be onwed by the new owner.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.transferTokenOwnership(addr1).then(() => {
          return meshToken.owner().then(owner => {
            assert.equal(owner, addr1, "Token owner should be updated to addr1 now");
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
          throw "should not be able to buy tokens with 0 limit";
        }).catch((  ) => {
          meshToken.balanceOf(addr1).then(balance => {
            assert.equal(0, balance, "Token balance should be 0");
          });
        });
      });
    });

    it('ERROR: should not be able to buy tokens more than the limit', () => {
      /**
       * Scenario:
       * 1. Contract owner calls the contract to increase the contribution limit for address
       * 2. User trying to contribute above set limits and total contribution cap is not reached yet
       * 3. Transaction should fail
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setLimit(addr1, contributionLimit).then(() => {
          return meshCrowdsale.sendTransaction({value: contributionLimit + 1, from: addr1}).then(() => {
            throw "should not be able to buy tokens with 0 limit";
          }).catch((  ) => {
            meshToken.balanceOf(addr1).then(balance => {
              assert.equal(0, balance, "Token balance should be 0");
            });
          });
        });
      });
    });

    it('SUCCESS: should be able to buy tokens in limit if the total cap is not yet reached', () => {
      /**
       * Scenario:
       * 1. Contract owner calls the contract to increase the contribution limit for address
       * 2. User trying to contribute within set limits and total contribution cap is not reached yet
       * 3. Transaction should succeed
       * 4. The address should have rate * contributionAmount number of tokens by now.
       * 5. wieContribution for the address should be recorded.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setLimit(addr1, contributionLimit).then(() => {
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

    it('SUCCESS: should be able to buy tokens multiple times in limit if the total cap is not yet reached', () => {
      /**
       * Scenario:
       * 1. Contract owner calls the contract to increase the contribution limit for address
       * 2. User trying to contribute within set limits and total contribution cap is not reached yet
       * 3. Transaction should succeed
       * 4. User trying second time to contribute within set limits and total contribution cap is not reached yet
       * 5. Transaction should succeed
       * 6. The address should have rate * contributionAmount number of tokens by now.
       * 7. wieContribution for the address should be recorded.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setLimit(addr1, contributionLimit).then(() => {
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

    it('ERROR: should not be able to buy tokens multiple times total contribution is outside limit even if the total cap is not yet reached', () => {
      /**
       * Scenario:
       * 1. Contract owner calls the contract to increase the contribution limit for address
       * 2. User trying to contribute within set limits and total contribution cap is not reached yet
       * 3. Transaction should succeed
       * 4. User contributes again within the limits
       * 5. Transaction should succeed
       * 6. User contributes again but this time exceeds the limit
       * 7. Transaction should fail
       * 8. The address should have rate * contributionAmount number of tokens by now.
       * 9. wieContribution for the address should be recorded.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.setLimit(addr1, contributionLimit).then(() => {
          return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
            return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
              // this transaction should fail as user is going above the limit with 3rd contribution
              return meshCrowdsale.sendTransaction({value: contributionAmount, from: addr1}).then(() => {
                throw "Should not reach here";
              }).catch(() => {
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
