pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract CarborCoin is MintableToken {
    string public name = "CarborCoin";
    string public symbol = "CBOR";
    uint8 public decimals = 18;
}