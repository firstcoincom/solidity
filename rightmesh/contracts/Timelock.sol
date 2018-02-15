// Contract to make MeshTokens available to employees with time.

pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Timelock is Ownable {

  using SafeMath for uint256;

  uint256 public cliff_time = 1550268556; // epoch timestamp
  uint256 public cliff_amount = 200000000; // in billionths, percentage is too small for rounding, between 0 and 1 000 000 000
  uint256 public gradual_amount = 800000000; // in billionths, percentage is too small for rounding, between 0 and 1 000 000 000
  uint256 public timelock_end = 1581804556;

  uint256 public gradual_unlock_rate_per_second;
  uint256 public whole_unit = 1000000000; // need a better name for this, it is like a percentage is to 100 as ??? is to 1 billion. This is to help with rounding.

  mapping (address => uint256) public allocated_tokens;
  mapping (address => uint256) public withdrawn_tokens;
  mapping (address => bool) public withdrawal_allowed;

  // constructor initializes allocated_tokens to address, owner, and rate per day (so that it needen't be calculated more than once) and does some sanity checks on provided values
  function Timelock() public {

    // sanity checks
    assert(cliff_amount.add(gradual_amount) <= whole_unit);
    assert(cliff_time > now);
    assert(timelock_end > cliff_time);

    allocated_tokens[0xaDe4A31E4FeC4a652B7A11A79a019bACf53124a0] = 10 ether;
    withdrawal_allowed[0xaDe4A31E4FeC4a652B7A11A79a019bACf53124a0] = true;

    allocated_tokens[0x6E5D1b7a916Cc41fCbC7a3428ca9692A1EB591f0] = 15 szabo;
    withdrawal_allowed[0x6E5D1b7a916Cc41fCbC7a3428ca9692A1EB591f0] = true;

    allocated_tokens[0x486C4898f36785Fcd671D3589C963dDA87235831] = 20 finney;
    withdrawal_allowed[0x486C4898f36785Fcd671D3589C963dDA87235831] = true;

    gradual_unlock_rate_per_second = gradual_amount.div(timelock_end.sub(cliff_time));
  }

  // ADMIN FUNCTIONS

  // owner can pause withdraw functionality for an address
  function pauseWithdrawal(address _address) onlyOwner public returns (bool) {
    withdrawal_allowed[_address] = false;
    return true;
  }

  // owner can unpause withdraw functionality for an address
  function unpauseWithdrawal(address _address) onlyOwner public returns (bool) {
    withdrawal_allowed[_address] = true;
    return true;
  }

  // WITHDRAW FUNCTIONS

  // returns the max percentage that can be withdrawn at this point in time and is a multiplier between 0 and 100.
  function withdrawPercentageCeiling() private view returns (uint256) {
    if (now < cliff_time) {
      return 0;
    } else if (now > cliff_time && now < timelock_end) {
      return (cliff_amount.add(gradual_unlock_rate_per_second.mul(now.sub(cliff_time)))); // worried about rounding here todo investigate
    } else if (now > timelock_end) {
      return 100;
    }
  }

  // helper returns max withdrawal for an address, delays division for better rounding
  function withdrawTokenCeiling(address _address) private view returns (uint256) {
    return (withdrawPercentageCeiling().mul(allocated_tokens[_address].sub(withdrawn_tokens[_address]))).div(whole_unit);
  }

  // sends tokens from contract to address
  function withdraw() public returns (bool) {
    uint256 availableTokens = withdrawTokenCeiling(msg.sender);
    if (withdrawal_allowed[msg.sender] && availableTokens > 0) {
      withdrawn_tokens[msg.sender] = withdrawn_tokens[msg.sender].add(availableTokens);
      // todo - do the transfer
      return true;
    } else {
      return false;
    }
  }

}
