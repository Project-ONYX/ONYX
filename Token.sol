pragma solidity ^0.4.8;

contract OnyxToken {
	string public constant name = "ONYX Token";
	string public constant symbol = "ONYX";
	uint8 public constant decimals = 18;
	
    uint256 totalSupply = 0;
	mapping (address => uint256) balances;
	mapping (address => mapping (address => uint256)) allowances;

	struct Vote {
		uint256 blockNum;
		uint256 value;
	}

	struct VoteCounter {
		uint256 num;
		uint256 totalValue;
	}

	mapping (address => mapping (string => uint256)) voteCalled;
	mapping (address => mapping (string => Vote)) voted;

	mapping (string => uint) voteTypes;
	voteTypes["Fee"] = 1;
	voteTypes["Stake"] = 2;
	voteTypes["Milestone"] = 3;

	string[3] voteTypesArr;
	voteTypesArr[0] = "Fee";
	voteTypesArr[1] = "Stake";
	voteTypesArr[2] = "Milestone";

	mapping (string => uint256) voteCalls;
	mapping (string => VoteCounter) votes;

	mapping (string => bool) votingActive;
	votingActive["Fee"] = false;
	votingActive["Stake"] = false;
	votingActive["Milestone"] = false;

	event Transfer(address indexed _from, address indexed _to, uint _value);
	event Approval(address indexed _owner, address indexed _spender, uint _value);
	event CallVote(address indexed _owner, string indexed _voteType);
	event Vote(address indexed _owner, string indexed _voteType, uint _numVotes, uint256 _vote);

	function OnyxToken(uint _callToVotePercent, uint _votePassPercent, uint _votingBlockWindowSize, uint _fee) {
		if (_callToVotePercent == 0) throw;
		if (_votePassPercent == 0) throw;
		if (_votingBlockWindowSize == 0) throw;

		fee = _fee;
		callToVotePercent = _callToVotePercent; // Percent of tokens calling a vote required to trigger vote (divide by 100)
		votePassPercent = _votePassPercent; // Percent of tokens voting required to pass a vote (divide by 100)
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
		if(balances[msg.sender] >= _value 
			&& _value > 0 
			&& balance[_to] + _value > balances[_to]) {

			balances[msg.sender] -= _value;
			balances[_to] += _value;

			checkVoteBlock();
			for(uint x = 0; x < voteTypesArr.length; x++) {
				type = voteTypesArr[x];
				transferVoteCall(msg.sender, _to, type, _value);
				transferVote(msg.sender, _to, type, _value);
			}
			Transfer(msg.sender, _to, _value);
			return true;
		} else {
			return false;
		}
	}
	
	function transferFrom(address _from, address _to, uint _value) returns (bool success) {
		if(balances[_from] >= _value 
			&& allowances[_from][msg.sender] >= _value 
			&& _value > 0
			&& balances[_to] + _value > balances[_to]) {

			balances[_from] -= _value;
			allowances[_from][msg.sender] -= _value;
			balances[_to] += _value;

			checkVoteBlock();
			for(uint x = 0; x < voteTypesArr.length; x++) {
				type = voteTypesArr[x];
				transferVoteCall(msg.sender, _to, type, _value);
				transferVote(msg.sender, _to, type, _value);
			}

			Transfer(_from, _to, _value);
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

	function transferVoteCall(address _owner, address _transfer, string _type, uint _value) returns (bool success) {
		if(hasCalledVote(_owner, _type)) {
			voteCalls[_type] -= _value;
		}
		if(hasCalledVote(_transfer, _type)) {
			voteCalls[_type] += _value;
			voteCalled[_transfer][_type] = block.number;
		}
		return true;
	}

	function transferVote(address _owner, address _transfer, string _type, uint _value) returns (bool success) {
		if(hasVoted(_owner, _type)) {
			votes[_type].num -= _value;
			votes[_type].totalValue -= _value*voted[_owner][_type].vote;
		}
		if(hasVoted(_transfer, _type)) {
			votes[_type].num += _value;
			votes[_type].totalValue += _value*voted[_transfer][_type].vote;
		}
		return true;
	}

	function hasCalledVote(address _owner, string _type) constant returns (bool truth) {
		if(voteCalled[_owner][_type] >= currentVoteBlock && voteCalled[_owner][_type] < endVoteBlock) {
			return true;
		} else {
			return false;
		}
	}

	function hasVoted(address _owner, string _type) constant returns (bool truth) {
		if(voted[_owner][_type].blockNum >= currentVoteBlock && voted[_owner][_type].blockNum < endVoteBlock) {
			return true;
		} else {
			return false;
		}
	}

	function isVotingActive(string _type) constant returns (bool active) {
		return votingActive[_type];
	}

	function checkVoteBlock() returns (bool success) {
		if(block.number >= endVoteBlock) {
			currentVoteBlock = endVoteBlock;
			endVoteBlock = currentVoteBlock + votingBlockWindowSize;

			if(votingActive["Fee"]) {
				if(votes["Fee"]/totalSupply >= votePassPercent/100) {
					// Apply vote
				}
				votingActive["Fee"] = false;
			} else {
				if(voteCalls["Fee"]/totalSupply >= callToVotePercent/100) {
					votingActive["Fee"] = true;
					votes["Fee"] = VoteCounter(0, 0);
				}
			}

			if(votingActive["Stake"]) {
				if(votes["Stake"]/totalSupply >= votePassPercent/100) {
					// Apply vote
				}
				votingActive["Stake"] = false;
			} else {
				if(voteCalls["Stake"]/totalSupply >= callToVotePercent/100) {
					votingActive["Stake"] = true;
					votes["Stake"] = VoteCounter(0, 0);
				}
			}

			if(votingActive["Milestone"]) {
				if(votes["Milestone"]/totalSupply >= votePassPercent/100) {
					// Apply vote
				}
				votingActive["Milestone"] = false;
			} else {
				if(voteCalls["Milestone"]/totalSupply >= callToVotePercent/100) {
					votingActive["Milestone"] = true;
					votes["Milestone"] = VoteCounter(0, 0);
				}
			}

			voteCalls["Fee"] = 0;
			voteCalls["Stake"] = 0;
			voteCalls["Milestone"] = 0;
			returns true;
		} else {
			returns false;
		}
	}

	function callVote(string _type) returns (bool success) {
		checkVoteBlock();
		if(!votingActive[_type] && voteTypes[_type] > 0 && !hasCalledVote(msg.sender, _type)) {
			voteCalled[msg.sender][_type] = block.number;
			voteCalls[_type] += balances[msg.sender];
			CallVote(msg.sender, _type);
			return true;
		} else {
			return false;
		}
	}

	function castVote(string _type, uint256 _vote) returns (bool success) {
		checkVoteBlock();
		if(votingActive[_type] && _vote >= 0) {
			if(!hasVoted(msg.sender, _type)) {
				votes[_type].num += balances[msg.sender];
				votes[_type].totalValue += balances[msg.sender]*_vote;
			} else {
				votes[_type].totalValue -= balances[msg.sender]*(voted[msg.sender][_type].value - _vote);
			}
			vote = Vote(block.number, _vote);
			voted[msg.sender][_type] = vote;
			Vote(msg.sender, _type, balances[msg.sender], _vote);
			return true;
		} else {
			return false;
		}
	}
}
