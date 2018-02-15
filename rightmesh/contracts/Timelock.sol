// Contract to make MeshTokens available to employees with time.

pragma solidity ^0.4.18;
contract Timelock {

  // todo use SAFEMATH!
  // todo decimals is a bad idea and won't work - need a way around this should use smallest unit for tokens (wei) and for time seconds is probably alright.
  // percentages need to be whole numbers... not sure on cleanest way to do this at the moment.

    address public owner; //owner of contract

    uint public cliff_time = 1518696000; //non feb 15 2018
    uint public cliff_amount = 0.2; //percentage - cliff_amount + gradual_amount = 1 THIS WON'T COMPILE AND DECIMALS ARE A VERY BAD IDEA
    uint public gradual_amount = 0.8; //percentage - cliff_amount + gradual_amount = 1 THIS WON'T COMPILE AND DECIMALS ARE A VERY BAD IDEA
    uint public timelock_end = 1525132800; //may 1 00:00:00 2018

    uint public rate_per_second;

    // allocation
    mapping (address => uint256) public allocated_tokens;
    mapping (address => uint256) public withdrawn_tokens;
    //ability to flag accounts
    mapping (address => bool) public withdrawal_allowed;

    //modifiers
    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }

    //constructor initializes allocated_tokens to address, owner, and rate per day (so that it needen't be calculated more than once)
    function Timelock() public {
      owner = msg.sender;

      allocated_tokens[0xaDe4A31E4FeC4a652B7A11A79a019bACf53124a0] = 10;
      withdrawal_allowed[0xaDe4A31E4FeC4a652B7A11A79a019bACf53124a0] = true;

      allocated_tokens[0x6E5D1b7a916Cc41fCbC7a3428ca9692A1EB591f0] = 15;
      withdrawal_allowed[0x6E5D1b7a916Cc41fCbC7a3428ca9692A1EB591f0] = true;

      allocated_tokens[0x486C4898f36785Fcd671D3589C963dDA87235831] = 20;
      withdrawal_allowed[0x486C4898f36785Fcd671D3589C963dDA87235831] = true;

      rate_per_second = gradual_amount / (timelock_end - cliff_time);
    }

    // ADMIN FUNCtIONS

    // owner can blacklist an address
    function blacklist(address _address) onlyOwner public returns (bool) {
      withdrawal_allowed[_address] = false;
      return true;
    }

    // owner can whitelist an address
    function whitelist(address _address) onlyOwner public returns (bool) {
      withdrawal_allowed[_address] = true;
      return true;
    }

    // WITHDRAW FUNCTIONS

    // this helper returns the max percentage that can be withdrawn at this point in time. Does not consider any amount already withdrawn (that will be later in withdraw)
    // return is a multiplier between 0 and 1.
    function withdrawPercentageCeiling() private view returns (uint256) {
      if (now < cliff_time) {
        return 0;
      } else if (now > cliff_time && now < timelock_end) {
        return (cliff_amount + (rate_per_second * (now - cliff_time)));
      } else if (now > timelock_end) {
        return 1;
      }
    }

    // hlper returns max withdrawal for an address
    function withdrawTokenCeiling(address _address) private view returns (uint256) {
      return ((withdrawPercentageCeiling() * allocated_tokens[_address]) - withdrawn_tokens[_address]);
    }

    // sends tokens from contract to address
    function withdraw(uint256 _amount) public returns (bool) {
      if (withdrawal_allowed[msg.sender] && (_amount <= withdrawTokenCeiling(msg.sender))) {
        withdrawn_tokens[msg.sender] -= _amount;
        // do the transfer
      } else {
        return false;
      }
    }

}
