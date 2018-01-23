const MeshToken = artifacts.require("MeshToken");

contract('MeshToken', (accounts) => {
  describe('constructor', () => {
    it('should deploy', () => {
      return MeshToken.new().then(meshToken => {
        assert.isOk(meshToken.address, "Should have a valid address");
      });
    });
  });

  describe('updateAllowedTransfers', () => {
    it('should be false by default', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.allowedTransfers(accounts[0]).then(allowedTransfers => {
          assert.equal(allowedTransfers, false, "should not be allowed transfers by default");
        });
      });
    });

    it('should allow setting allowedTransfers to true by owner', () => {
      return MeshToken.new().then(meshToken => {
        return meshToken.updateAllowedTransfers(accounts[0], true).then(() => {
          return meshToken.allowedTransfers(accounts[0]).then(allowedTransfers => {
            assert.equal(allowedTransfers, true, "should not be allowed transfers by default");
          });
        });
      });
    });

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
});
