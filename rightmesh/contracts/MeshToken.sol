pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';

contract MeshToken is CappedToken, PausableToken {
  string public name = "MESH TOKEN";
  string public symbol = "MESH";
  uint8 public decimals = 18;
  uint256 public cap = 100000000;

  /**
   * @dev variable to keep track of what addresses are allowed to call transfer functions when token is paused.
   */
  mapping (address => bool) public allowedTransfers;

  /**
   * @dev constructor for mesh token
   */
  function MeshToken() CappedToken(cap) public {}

  /**
   * @dev Overridder modifier to allow exceptions for pausing for a given address
   */
  modifier whenNotPaused() {
    require(!paused || allowedTransfers[msg.sender]);
    _;
  }

  /**
   * @dev method to updated allowedTransfers for an address
   * @param _address that needs to be updated
   * @param _allowedTransfers indicating if transfers are allowed or not
   * @return boolean indicating function success.
   */
  function updateAllowedTransfers(address _address, bool _allowedTransfers)
  public
  onlyOwner
  returns (bool)
  {
    // don't allow owner to change this for themselves
    // otherwise whenNotPaused will not work as expected for owner,
    // therefore prohibiting them from calling pause/unpause.
    require(_address != owner);

    allowedTransfers[_address] = _allowedTransfers;
    return true;
  }
}
