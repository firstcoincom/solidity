const MeshToken = artifacts.require("MeshToken");

contract('MeshToken', (accounts) => {
  describe('constructor', () => {
    it('should deploy', () => {
      return MeshToken.new().then(meshToken => {
        assert.isOk(meshToken.address, "Should have a valid address");
      });
    });
  });
});
