pragma solidity ^0.4.11;

import './ERC20.sol';
import './MintableToken.sol';
import '../lib/math/SafeMath.sol';

/**
 * @title OnyxToken
 * @dev Full Token contract for the ONYX token. Includes voting as its
 * largest change from the Mintable Token. Voting includes the act of 
 * vote calling (calling an item to vote) and the actual voting process.
 * Also requires the editing of the transfer and transferFrom methods in
 * order to keep track of the votes as tokens change hands and to prevent
 * double voting.
 */
contract OnyxToken is ERC20, MintableToken {
    using SafeMath for uint256;

    string public constant name = "ONYX Token";
    string public constant symbol = "ONYX";
    uint8 public constant decimals = 18;
    
    uint fee;
    uint stake;
    uint callToVoteThreshold;
    uint voteEffectiveThreshold;
    uint256 votingBlockWindowSize;
    uint256 currentVoteBlock;
    uint256 endVoteBlock;

    struct VoteStruct {
        uint256 blockNum;
        uint256 value;
    }

    struct VoteCounter {
        uint256 num;
        uint256 totalValue;
    }

    mapping (address => mapping (string => uint256)) voteCalled;
    mapping (address => mapping (string => VoteStruct)) voted;

    mapping (string => uint) voteTypes;

    string[2] voteTypesArr;

    mapping (string => uint256) voteCalls;
    mapping (string => VoteCounter) votes;

    mapping (string => bool) votingActive;

    event CallVote(address indexed _owner, string _voteType);
    event Vote(address indexed _owner, string _voteType, uint _numVotes, uint256 _vote);

    /**
    * @dev Constructor
    * @param _callToVoteThreshold uint is the threshold of voter participation required to call vote (1-100)
    * @param _voteEffectiveThreshold uint is the threshold of voter participation required (non status quo votes) to apply vote (1-100)
    * @param _votingBlockWindowSize uint256 is the size of the voting window in blocks
    * @param _fee uint is the fee applied for transactions in the ONYX network
    * @param _stake uint is the stake required for participation in the ONYX network
    */
    function OnyxToken(uint _callToVoteThreshold, uint _voteEffectiveThreshold, uint256 _votingBlockWindowSize, uint _fee, uint _stake) {
        require (_callToVoteThreshold > 0 && _callToVoteThreshold <= 100);
        require (_voteEffectiveThreshold > 0 && _voteEffectiveThreshold <= 100);
        require (_votingBlockWindowSize > 0);
        require (_fee >= 0 && _stake >= 0);

        balances[tx.origin] = 10000;
        fee = _fee;                                                 // part per thousand representation of the fee percentage (3 means .003)
        stake = _stake;                                             // number of tokens needed to use onyx network
        callToVoteThreshold = _callToVoteThreshold;                 // Percent of tokens calling a vote required to trigger vote (divide by 100)
        voteEffectiveThreshold = _voteEffectiveThreshold;           // Percent of tokens voting required to pass a vote (divide by 100)
        votingBlockWindowSize = _votingBlockWindowSize;             // Window for collecting vote calls
        currentVoteBlock = block.number;                            // Current block window start block
        endVoteBlock = currentVoteBlock.add(votingBlockWindowSize); // End of current vote window block

        voteTypes["Fee"] = 1;
        voteTypes["Stake"] = 2;
        voteTypesArr[0] = "Fee";
        voteTypesArr[1] = "Stake";
        votingActive["Fee"] = false;
        votingActive["Stake"] = false;
    }

    /**
    * @dev Transfer tokens to another address
    * @param _to address The address which you want to transfer to
    * @param _value uint256 the amout of tokens to be transferred
    */
    function transfer(address _to, uint256 _value) returns (bool) {
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);

        checkVoteBlock();
        for(uint x = 0; x < voteTypesArr.length; x++) {
            transferVoteCall(msg.sender, _to, voteTypesArr[x], _value);
            transferVote(msg.sender, _to, voteTypesArr[x], _value);
        }
        Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
    * @dev Transfer tokens from one address to another
    * @param _from address The address which you want to send tokens from
    * @param _to address The address which you want to transfer to
    * @param _value uint256 the amout of tokens to be transferred
    */
    function transferFrom(address _from, address _to, uint256 _value) returns (bool) {
        balances[_to] = balances[_to].add(_value);
        balances[_from] = balances[_from].sub(_value);
        allowances[_from][msg.sender] -= allowances[_from][msg.sender].sub(_value);

        checkVoteBlock();
        for(uint x = 0; x < voteTypesArr.length; x++) {
            transferVoteCall(msg.sender, _to, voteTypesArr[x], _value);
            transferVote(msg.sender, _to, voteTypesArr[x], _value);
        }
        Transfer(_from, _to, _value);
        return true;
    }

    /**
    * @dev Getter method for stake variable
    */
    function getStake() constant returns (uint) {
        return stake;
    }

    /**
    * @dev Getter method for fee variable
    */
    function getFee() constant returns (uint) {
        return fee;
    }    

    /**
    * @dev Transfer vote calls from one address to another during a token transfer
    * @param _owner address The address which you want to send from
    * @param _transfer address The address which you want to transfer to
    * @param _type string The vote call type being transferred
    * @param _value uint256 the amout of tokens to be transferred
    */
    function transferVoteCall(address _owner, address _transfer, string _type, uint256 _value) returns (bool) {
        if(hasCalledVote(_owner, _type)) {
            voteCalls[_type] = voteCalls[_type].sub(_value);
        }
        if(hasCalledVote(_transfer, _type)) {
            voteCalls[_type] = voteCalls[_type].add(_value);
            voteCalled[_transfer][_type] = block.number;
        }
        return true;
    }

    /**
    * @dev Transfer votes from one address to another during a token transfer
    * @param _owner address The address which you want to send from
    * @param _transfer address The address which you want to transfer to
    * @param _type string The vote type being transferred
    * @param _value uint256 the amout of tokens to be transferred
    */
    function transferVote(address _owner, address _transfer, string _type, uint256 _value) returns (bool) {
        if(hasVoted(_owner, _type)) {
            votes[_type].num = votes[_type].num.sub(_value);
            uint256 ownerValue = _value.mul(voted[_owner][_type].value);
            votes[_type].totalValue = votes[_type].totalValue.sub(ownerValue);
        }
        if(hasVoted(_transfer, _type)) {
            votes[_type].num = votes[_type].num.add(_value);
            uint256 transferValue = _value.mul(voted[_transfer][_type].value);
            votes[_type].totalValue = votes[_type].totalValue.add(transferValue);
        }
        return true;
    }

    /**
    * @dev Returns whether the account has called for vote for a type
    * @param _owner address The address of which the vote call status is being checked
    * @param _type string The vote call type being addressed
    */
    function hasCalledVote(address _owner, string _type) constant returns (bool) {
        if(voteCalled[_owner][_type] >= currentVoteBlock && voteCalled[_owner][_type] < endVoteBlock) {
            return true;
        } else {
            return false;
        }
    }

    /**
    * @dev Returns whether the account has voted for a type
    * @param _owner address The address of which the vote status is being checked
    * @param _type string The vote call type being addressed
    */
    function hasVoted(address _owner, string _type) constant returns (bool) {
        if(voted[_owner][_type].blockNum >= currentVoteBlock && voted[_owner][_type].blockNum < endVoteBlock) {
            return true;
        } else {
            return false;
        }
    }

    /**
    * @dev Returns whether voting is active for a type of vote
    * @param _type string The vote call type being addressed
    */
    function isVotingActive(string _type) constant returns (bool) {
        return votingActive[_type];
    }

    function getVotesCalled(string _type) constant returns (uint256) {
        return voteCalls[_type];
    }

    /**
    * @dev Returns checks and advances the voting block.
    *      Also responsible for applying the results of votes.
    */
    function checkVoteBlock() returns (bool) {
        if(block.number >= endVoteBlock) {
            currentVoteBlock = endVoteBlock;
            endVoteBlock = currentVoteBlock.add(votingBlockWindowSize);
            uint256 effectiveTotalValue = 0;

            // FEE VOTING 
            if(votingActive["Fee"]) {
                if(votes["Fee"].num/totalSupply >= voteEffectiveThreshold/100) {
                    effectiveTotalValue = votes["Fee"].totalValue.add(fee.mul(totalSupply.sub(votes["Fee"].num))).mul(1000);
                    fee = effectiveTotalValue.div(totalSupply);
                }
                votingActive["Fee"] = false;
            } else {
                if(voteCalls["Fee"]/totalSupply >= callToVoteThreshold/100) {
                    votes["Fee"] = VoteCounter(0, 0);
                    votingActive["Fee"] = true;
                }
            }

            // STAKE VOTING
            if(votingActive["Stake"]) {
                if(votes["Stake"].num/totalSupply >= voteEffectiveThreshold/100) {
                    effectiveTotalValue = votes["Stake"].totalValue.add(stake.mul(totalSupply.sub(votes["Stake"].num)));
                    stake = effectiveTotalValue.div(totalSupply);
                }
                votingActive["Stake"] = false;
            } else {
                if(voteCalls["Stake"]/totalSupply >= callToVoteThreshold/100) {
                    votes["Stake"] = VoteCounter(0, 0);
                    votingActive["Stake"] = true;
                }
            }

            voteCalls["Fee"] = 0;
            voteCalls["Stake"] = 0;
            return true;
        } else {
            return false;
        }
    }

    /**
    * @dev Call for a vote of a certain type
    * @param _type string The vote call type being addressed
    */
    function callVote(string _type) returns (bool) {
        checkVoteBlock();
        if(!votingActive[_type] && voteTypes[_type] > 0 && !hasCalledVote(msg.sender, _type)) {
            voteCalled[msg.sender][_type] = block.number;
            voteCalls[_type] = voteCalls[_type].add(balances[msg.sender]);
            CallVote(msg.sender, _type);
            return true;
        } else {
            return false;
        }
    }

    /**
    * @dev Cast a vote for a certain type
    * @param _type string The vote call type being addressed
    */
    function castVote(string _type, uint256 _vote) returns (bool) {
        checkVoteBlock();
        if(votingActive[_type] && _vote >= 0 && _vote <= 100) {
            if(!hasVoted(msg.sender, _type)) {
                votes[_type].num = votes[_type].totalValue.add(balances[msg.sender]);
                votes[_type].totalValue = votes[_type].totalValue.add(balances[msg.sender].mul(_vote));
            } else {
                votes[_type].totalValue = balances[msg.sender].mul(voted[msg.sender][_type].value.sub(_vote));
            }
            voted[msg.sender][_type] = VoteStruct(block.number, _vote);
            Vote(msg.sender, _type, balances[msg.sender], _vote);
            return true;
        } else {
            return false;
        }
    }
}
