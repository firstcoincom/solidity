pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/CappedToken.sol';

contract MeshToken is CappedToken {
  string public name = "MESH TOKEN";
  string public symbol = "MESH";
  uint8 public decimals = 18;

  /**
   *  @dev address that is allowed to mint new token
   */
  address public minter;

  /**
   * @dev constructor for mesh token
   * @param _cap The total number of tokens that can ever be minted
   */
  function MeshToken(uint256 _cap) CappedToken(_cap) public {}

  /**
   * @dev method to change the minter address for crowdsale
   * @param _minter address that is being used for minting new tokens
   * @return A boolean that indicates if the operation was successful.
   */
  function setMinter (address _minter) public onlyOwner returns (bool) {
    minter = _minter;
    return true;
  }

  /**
   * @dev Throws if called by any account other than the minter.
   */
  modifier onlyMinter() {
    require(minter != address(0));
    require(msg.sender == minter);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   *
   * modifier changed to onlyMinter compared to original method
   */
  function mint(address _to, uint256 _amount) onlyMinter canMint public returns (bool) {
    return super.mint(_to, _amount);
  }
}
