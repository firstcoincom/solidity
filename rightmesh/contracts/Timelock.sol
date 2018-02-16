pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import "zeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";

/**
 * @title TokenTimelock
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme with a cliff, gradual release period, and implied residue.
 * Withdraws by an address can be paused by the owner.
 */
contract Timelock is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for ERC20Basic;

  ERC20Basic public token;

  uint256 public startTime; // timestamp at which the timelock schedule begins
  uint256 public cliffDuration; // number of seconds from startTime to cliff
  uint256 public cliffReleasePercentage; // a percentage that becomes available at the cliff, expressed as a number between 0 and 100
  uint256 public gradualDuration; // number of seconds from cliff to residue, over this period tokens become avialable gradually
  uint256 public gradualReleasePercentaget; // a percentage that becomes avilable over the gradual release perios expressed as a number between 0 and 100

  //todo make this a struct
  mapping (address => uint256) public allocatedTokens;
  mapping (address => uint256) public withdrawnTokens;
  mapping (address => bool) public withdrawalBlocked;

  // constructor initializes fields and performs some sanity checks on provided values
  function Timelock(ERC20Basic _token, uint256 _startTime, uint256 _cliffDuration, uint256 _cliffReleasePercent, uint256 _gradualDuration, uint256 _gradualReleasePercentage) public {

    // sanity checks
    assert(_cliffReleasePercent.add(gradualReleasePercentaget) <= 100);
    assert(_startTime > now);

    token = _token;
    startTime = _startTime;
    cliffDuration = _cliffDuration;
    cliffReleasePercentage = _cliffReleasePercent;
    gradualDuration = _gradualDuration;
    gradualReleasePercentaget = _gradualReleasePercentage;

    // allocatedTokens[0x14723a09acff6d2a60dcdf7aa4aff308fddc160c] = 10 ether;

    allocatedTokens[0xaDe4A31E4FeC4a652B7A11A79a019bACf53124a0] = 10 ether;

    allocatedTokens[0x6E5D1b7a916Cc41fCbC7a3428ca9692A1EB591f0] = 15 szabo;

    allocatedTokens[0x486C4898f36785Fcd671D3589C963dDA87235831] = 20 finney;
  }

  function pauseWithdrawal(address _address) onlyOwner public returns (bool) {
    withdrawalBlocked[_address] = true;
    return true;
  }

  function unpauseWithdrawal(address _address) onlyOwner public returns (bool) {
    withdrawalBlocked[_address] = false;
    return true;
  }

  function availableForWithdrawal(address _address) public view returns (uint256) {
    if (now < startTime.add(cliffDuration)) {
      return 0;
    } else if (now > startTime.add(cliffDuration) && now < startTime.add(cliffDuration).add(gradualDuration)) {
      uint256 cliffTokens = (cliffReleasePercentage.mul(allocatedTokens[_address])).div(100);
      uint256 divisor = gradualDuration.mul(100);
      return (((((now.sub(startTime.add(cliffDuration))).mul(gradualReleasePercentaget)).mul(allocatedTokens[_address])).div(divisor)).add(cliffTokens)).sub(withdrawnTokens[_address]);
    } else if (now > startTime.add(cliffDuration).add(gradualDuration)) {
      return allocatedTokens[_address].sub(withdrawnTokens[_address]);
    }
  }

  function withdraw() public returns (bool) {
    uint256 availableTokens = availableForWithdrawal(msg.sender);
    require(!withdrawalBlocked[msg.sender] && availableTokens > 0);
    withdrawnTokens[msg.sender] = withdrawnTokens[msg.sender].add(availableTokens);
    token.safeTransfer(msg.sender, availableTokens);
    return true;
  }

}
