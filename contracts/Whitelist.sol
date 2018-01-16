pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Whitelist is Ownable {

  mapping(address => bool) public isWhitelisted;

  /**
   * @dev update isWhitelisted to whitelist an address
   * @param _address address that needs to be whitelisted
   * @return boolean indicating function success
   */
  function updateWhitelist(address _address, bool value)
  onlyOwner
  public
  returns (bool) {
    isWhitelisted[_address] = value;
    return true;
  }
}
