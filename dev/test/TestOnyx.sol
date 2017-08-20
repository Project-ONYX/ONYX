pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/token/OnyxToken.sol";

contract TestOnyx {
  OnyxToken onyx = new OnyxToken(20, 20, 100, 1, 10);
  address addr_0 = tx.origin;
  address addr_1 = 0x42a37c0cEd93a8266e6F1762A9A834e96800Ccf3;

  function testInitialBalance() {
    uint expected = 0;

    Assert.equal(onyx.balanceOf(addr_0), expected, "Owner should have 0 OnyxToken initially");
  }
}
