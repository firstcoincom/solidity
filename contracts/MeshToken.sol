pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

contract MeshToken is CappedToken, PausableToken {
  string public name = "MESH TOKEN";
  string public symbol = "MESH";
  uint8 public decimals = 18;

  /**
   * @dev constructor for mesh token
   * @param _cap The total number of tokens that can ever be minted
   */
  function MeshToken(uint256 _cap) CappedToken(_cap) public {}
}
