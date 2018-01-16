pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Whitelist.sol";

contract TestWhitelist {


  function testInitialWhitelist() public {
    Whitelist whitelist = new Whitelist();

    Assert.equal(whitelist.isWhitelisted(tx.origin), false, "Any address by default should not be whitelisted");
  }

  function testWhitelistUpdateWhitelistSuccessOwner() public {
    Whitelist whitelist = new Whitelist();
    bool r = whitelist.updateWhitelist(tx.origin, true);

    Assert.equal(r, true, "should return true when called by owner");
  }

  function testWhitelistIsWhitelistedTrue() public {
    Whitelist whitelist = new Whitelist();
    whitelist.updateWhitelist(tx.origin, true);

    Assert.equal(whitelist.isWhitelisted(tx.origin), true, "address should be whitelisted by now");
  }

  function testWhitelistIsWhitelistedFalse() public {
    Whitelist whitelist = new Whitelist();
    whitelist.updateWhitelist(tx.origin, true);
    whitelist.updateWhitelist(tx.origin, false);

    Assert.equal(whitelist.isWhitelisted(tx.origin), false, "address should not be whitelisted by now");
  }
}
