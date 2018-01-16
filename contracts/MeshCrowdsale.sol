pragma solidity ^0.4.15;

import './MeshToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';


contract MeshCrowdsale is CappedCrowdsale {

  /**
   * @dev address of token that is being minted by the crowdsale
   * replace 0x00 with the token address when deploying
   */
  address public tokenAddress = address(0x00);

  /**
   * @dev Constructor for MeshCrowdsale contract
   */
  function MeshCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap)
    CappedCrowdsale(_cap)
    Crowdsale(_startTime, _endTime, _rate, _wallet)
    public
    {
    }

  // creates the token to be sold.
  // overridden method to point to already deployed token
  function createTokenContract() internal returns (MintableToken) {
    return MeshToken(tokenAddress);
  }

}
