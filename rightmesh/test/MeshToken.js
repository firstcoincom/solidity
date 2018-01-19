const MeshToken = artifacts.require("MeshToken");

contract('MeshToken', (accounts) => {
  const cap = 100000000;

  describe('constructor', () => {
    it('should set defaults in constructor', () => {
      return MeshToken.new(cap).then(meshToken => {
        return Promise.all([
          meshToken.cap()
        ]).then(results => {
          assert.equal(results[0], cap, "By default cap should be equal to what passed in the constructor")
        });
      });
    });
  });
});
