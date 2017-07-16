pragma solidity ^0.4.8;

contract OnyxToken {
	string public constant name = "ONYX Token";
	string public constant symbol = "ONYX";
	uint8 public constant decimals = 18;
	
    uint256 totalSupply = 0;
	mapping (address => uint256) balances;
	mapping(address => mapping (address => uint256)) allowances;
	
	event Transfer(address indexed _from, address indexed _to, uint _value);
	event Approval(address indexed _owner, address indexed _spender, uint _value);
	
	function OnyxToken() {
		
	}
	
	function tokenSupply() constant returns (uint totalSupply) {
		return totalSupply;
	}
	
	function balanceOf(address _owner) constant returns (uint balance) {
		returns balances[_owner];
	}
	
	function transfer(address _to, uint _value) returns (bool success) {
		if(balances[msg.sender] >= _amount 
			&& _amount > 0 
			&& balance[_to] + _amount > balances[_to]) {

			balances[msg.sender] -= _amount;
			balances[_to] += _amount;
			Transfer(msg.sender, _to, _amount);
			return true;
		} else {
			return false;
		}
	}
	
	function transferFrom(address _from, address _to, uint _value) returns (bool success) {
		if(balances[_from] >= _value 
			&& allowances[_from][msg.sender] >= _value 
			&& _amount > 0
			&& balances[_to] + _amount > balances[_to]) {

			balances[_from] -= _amount;
			allowances[_from][msg.sender] -= _amount;
			balances[_to] += _amount;
			Transfer(_from, _to, _amount);
			return true;
		} else {
			return false;
		}
	}
	
	function approve(address _spender, uint _value) returns (bool success) {
		allowances[msg.sender][_spender] = _value;
		return true;
	}
	
	function allowance(address _owner, address _spender) constant returns (uint remainining) {
		return allowances[_owner][_spender];
	}
}
