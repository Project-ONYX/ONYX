pragma solidity ^0.4.8;

contract OnyxToken {
	string public constant name = "ONYX Token";
	string public constant symbol = "ONYX";
	uint8 public constant decimals = 18;
	
    uint256 totalSupply = 0;
	mapping (address => uint256) balances;
	mapping (address => mapping (address => uint256)) allowances;
	mapping (address => mapping (string => bool)) voteCalled;
	mapping (address => mapping (string => bool)) voted;

	mapping (string => uint) voteTypes;
	voteTypes["Fee"] = 1;
	voteTypes["Stake"] = 2;
	voteTypes["Milestone"] = 3;

	mapping (string => uint256) voteCalls;
	mapping (string => uint256) votes;

	// Voting explanation:
	// When calling vote, voteCalled is moved to true and voteCalls is incremented by the number of tokens address has.
	// 	if the address transfers tokens and voteCalled is true then the amount of tokens transfered is "unvoteCalled" by subtracting it from voteCalls to clean token (need to check if recipient voteCalled in which case don't)
	// Mirroring situation for voting also.

	event Transfer(address indexed _from, address indexed _to, uint _value);
	event Approval(address indexed _owner, address indexed _spender, uint _value);
	event CallVote(address indexed _owner, string indexed _voteType);
	event Vote(address indexed _ownder, string indexed _voteType, uint _numVotes, uint _vote);

	function OnyxToken(uint _callToVotePercent, uint _votePassPercent, uint _votingBlockWindowSize) {
		if (_callToVotePercent == 0) throw;
		if (_votePassPercent == 0) throw;
		if (_votingBlockWindowSize == 0) throw;

		callToVotePercent = _callToVotePercent; // Percent of tokens calling a vote required to trigger vote
		votePassPercent = _votePassPercent; // Percent of tokens voting required to pass a vote
		votingBlockWindowSize = _votingBlockWindowSize; // Window for collecting vote calls
		currentVoteBlock = block.number; // Current block window start block
		endVoteBlock = currentVoteBlock + votingBlockWindowSize; // End of current vote window block
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

	function callVote(uint _type) returns (bool success) {

	}

	function castVote(uint _type) returns (bool success) {

	}
}
