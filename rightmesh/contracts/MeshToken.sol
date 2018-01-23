pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

contract MeshToken is CappedToken, PausableToken {
  string public name = "MESH TOKEN";
  string public symbol = "MESH";
  uint8 public decimals = 18;
  uint256 public cap = 100000000;

  /**
   * @dev constructor for mesh token
   */
  function MeshToken() CappedToken(cap) public {}
}
