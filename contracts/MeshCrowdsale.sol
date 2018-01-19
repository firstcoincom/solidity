pragma solidity ^0.4.15;

import './MeshToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract MeshCrowdsale is CappedCrowdsale, Ownable {

  using SafeMath for uint256;

  /**
   * @dev weiLimits keeps track of amount of wei that can be contibuted by an address.
   */
  mapping (address => uint256) public weiLimits;

  /**
   * @dev weiContributions keeps track of amount of wei that are contibuted by an address.
   */
  mapping (address => uint256) public weiContributions;

  /*---------------------------------constructor---------------------------------*/

  /**
   * @dev Constructor for MeshCrowdsale contract
   */
  function MeshCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap, address _tokenAddress)
  CappedCrowdsale(_cap)
  Crowdsale(_startTime, _endTime, _rate, _wallet)
  public
  {
    token = MeshToken(_tokenAddress);
  }

  /*---------------------------------overridden methods---------------------------------*/

  // dummy function to create a token instance
  // overridden method to point to already deployed token
  /**
   * overriding Crowdsale#createTokenContract to point to a 0 address
   * actual token address mapping happens in the Constructor.
   */
  function createTokenContract() internal returns (MintableToken) {
    return MeshToken(address(0));
  }


  /**
   * overriding Crowdsale#buyTokens to keep track of wei contributed per address
   */
  function buyTokens(address beneficiary) public payable {
    weiContributions[msg.sender] = weiContributions[msg.sender].add(msg.value);
    super.buyTokens(beneficiary);
  }

  /**
   * overriding CappedCrowdsale#validPurchase to add extra contribution limit logic
   * @return true if investors can buy at the moment
   */
  function validPurchase() internal view returns (bool) {
    bool withinLimit = weiContributions[msg.sender] <= weiLimits[msg.sender];
    return super.validPurchase() && withinLimit;
  }



  /*---------------------------------new methods---------------------------------*/

  /**
   * @dev Allows the current owner to update contribution limits
   * @param _address whose contribution limits should be changed
   * @param _weiLimit new contribution limit
   * @return boolean indicating function success.
   */
  function setLimit(address _address, uint256 _weiLimit) public onlyOwner returns (bool) {
    // only allow changing the limit to be greater than current contribution
    require(_weiLimit >= weiContributions[_address]);
    weiLimits[_address] = _weiLimit;
    return true;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferTokenOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    token.transferOwnership(newOwner);
  }
}
