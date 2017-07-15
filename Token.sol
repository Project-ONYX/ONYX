pragma solidity ^0.4.4;

contract OnyxToken {
	string public constant name = "ONYX Token";
	string public constant symbol = "ONYX";
	uint8 public constant decimals = 18;
	
    uint256 totalTokens = 0;
	mapping (address => uint256) balances;
	mapping(address => mapping (address => uint256)) allowed;
	
	event Transfer(address indexed _from, address indexed _to, uint _value);
	event Approval(address indexed _owner, address indexed _spender, uint _value);
	
	function OnyxToken() {
		
	}
	
	function tokenSupply() constant returns (uint totalSupply) {
		return totalTokens;
	}
	
	function balanceOf(address _owner) constant returns (uint balance) {
		returns balances[_owner];
	}
	
	function transfer(address _to, uint _value) returns (bool success) {
	
	}
	
	function transferFrom(address _from, address _to, uint _value) returns (bool success) {
	
	}
	
	function approve(address _spender, uint _value) returns (bool success) {
	
	}
	
	function allowance(address _owner, address _spender) constant returns (uint remainining) {
	
	}
}
