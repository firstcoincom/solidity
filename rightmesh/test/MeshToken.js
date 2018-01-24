const MeshToken = artifacts.require("MeshToken");

contract('MeshToken', (accounts) => {
  describe('constructor', () => {
    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     */
    it('should deploy', () => {
      return MeshToken.new().then(meshToken => {
        assert.isOk(meshToken.address, "Should have a valid address");
      });
    });
  });

  describe('updateAllowedTransfers', () => {
    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. For any address default value for allowedTransfers is set to false.
     */
    it('should be false by default', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.allowedTransfers(accounts[0]).then(allowedTransfers => {
          assert.equal(allowedTransfers, false, "should not be allowed transfers by default");
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Owner tries to change the value of allowedTransfers for an address setting it to true.
     */
    it('should allow setting allowedTransfers to true by owner', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.updateAllowedTransfers(accounts[0], true).then(() => {
          return meshToken.allowedTransfers(accounts[0]).then(allowedTransfers => {
            assert.equal(allowedTransfers, true, "should not be allowed transfers by default");
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Owner tries to change the value of allowedTransfers for an address setting it to false.
     */
    it('should allow setting allowedTransfers to false by owner', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.updateAllowedTransfers(accounts[0], true).then(() => {
          return meshToken.updateAllowedTransfers(accounts[0], false).then(() => {
            return meshToken.allowedTransfers(accounts[0]).then(allowedTransfers => {
              assert.equal(allowedTransfers, false, "should not be allowed transfers by default");
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Non-owner tries to call the method to change the value of allowedTransfers for an address.
     */
   it('should not allow setting allowedTransfers by non-owner', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.allowedTransfers(accounts[0]).then(originalAllowedTransfers => {
            assert.equal(originalAllowedTransfers, false, "should be false by default.");
          return meshToken.updateAllowedTransfers(accounts[0], true, { from: accounts[1]}).then(() => {
            throw 'should not reach here';
          }).catch(() => {
            return meshToken.allowedTransfers(accounts[0]).then(allowedTransfers => {
              assert.equal(allowedTransfers, originalAllowedTransfers, "should still be set to what it was before.");
            });
          })
        });
      });
    });
  });

  describe('pause/unpause token transfers', () => {
    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. By default paused is set to false for the token.
     */
    it('should be unpaused by default', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.paused().then(paused => {
          assert.equal(paused, false, "should be unpaused by default");
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Owner calls pause on the contract.
     */
    it('should allow owner to pause the token', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.pause().then(() => {
          return meshToken.paused().then(paused => {
            assert.equal(paused, true, "should be paused by now");
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Owner calls pause on the contract.
     * 3. Owner calls unpause on the contract.
     */
    it('should allow owner to unpause', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.pause().then(() => {
          return meshToken.unpause().then(() => {
            return meshToken.paused().then(paused => {
              assert.equal(paused, false, "should be unpaused by now");
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Non-onwer tries to call pause on the contract.
     */
    it('should not allow non-owner to pause the token', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.pause({ from: accounts[1] }).then(() => {
          throw 'should not reach here';
        }).catch(() => {
          return meshToken.paused().then(paused => {
            assert.equal(paused, false, "should not be paused");
          });
        })
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Owner calls pause on the contract.
     * 3. Non-owner tries to call unpause on the contract.
     */
    it('should not allow non-owner to unpause the token', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.pause().then(() => {
          return meshToken.unpause({ from: accounts[1]}).then(() => {
            throw 'should not reach here';
          }).catch(() => {
            return meshToken.paused().then(paused => {
              assert.equal(paused, true, "should not be unpaused");
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Owner calls pause on the contract.
     * 3. Owner tries to call pause again without first unpausing the contract.
     */
    it('should only allow owner to pause when not paused', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.pause().then(() => {
          return meshToken.pause().then(() => {
            throw 'should not reach here';
          }).catch(() => {
            return meshToken.paused().then(paused => {
              assert.equal(paused, true, "should be paused by now");
            });
          });
        });
      });
    });

    /**
     * Scenario:
     * 1. Token contract is deployed successfully.
     * 2. Owner tries to call unpause on already unpaused token.
     */
    it('should only allow owner to unpause when paused', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.unpause().then(() => {
          throw 'should not reach here';
        }).catch(() => {
          return meshToken.paused().then(paused => {
            assert.equal(paused, false, "should be unpaused already");
          });
        });
      });
    });
  });
});
