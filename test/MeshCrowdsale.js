const MeshCrowdsale = artifacts.require("MeshCrowdsale");
const MeshToken = artifacts.require("MeshToken");

contract('MeshCrowdsale', (accounts) => {
  const startTime = Math.floor(Date.now() / 1000) + 500000000;
  const endTime = startTime + 10000000;
  const rate = 100;
  const wallet = "0x5aeda56215b167893e80b4fe645ba6d5bab767de";
  const crowdsaleCap = 10000;
  const tokenCap = 100000000;

  const addr1 = "0x5aeda56215b167893e80b4fe645ba6d5bab76723";
  const contributionLimit = 100;

  const getContracts = () => {
    return MeshToken.new(tokenCap).then(meshToken => {
      return MeshCrowdsale.new(startTime, endTime, rate, wallet, crowdsaleCap, meshToken.address).then(meshCrowdsale => {
        return { meshCrowdsale, meshToken };
      });
    });
  }

  describe('constructor', () => {
    it('should set defaults in constructor', () => {
      return getContracts().then(({ meshCrowdsale, meshToken}) => {
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

  describe('updateLimit',  () => {
    it('should update limit correctly', () => {
      /**
       * Scenario:
       * 1. Contract owner calling contract to update contribution limit for an address.
       * 2. Anyone being able to read weiLimits for an address.
       */
      return getContracts().then(({ meshCrowdsale, meshToken }) => {
        return meshCrowdsale.updateLimit(addr1, contributionLimit).then(() => {
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
        return meshToken.transferOwnership(meshCrowdsale.address).then(() => {
          return meshCrowdsale.transferTokenOwnership(addr1).then(() => {
            return meshToken.owner().then(owner => {
              assert.equal(owner, addr1, "Token owner should be updated to addr1 now");
            });
          });
        });
      });
    });
  });
});
