pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import '../token/OnyxToken.sol';
import '../lib/Ownable.sol';
import './ValidatorNetwork.sol';
import './ReqEngContractFactory.sol';

/**
 * @title ReqEngContract
 * @dev Smart Contract in charge of dealing with
 * the transaction between a requester and engineer.
 * Handles 
 */
contract ReqEngContract is Ownable {
    using SafeMath for uint256;

    address public Requester;
    address public Engineer;
    address public Validator;

    OnyxToken Onyx;
    ValidatorNetwork Validators;
    ReqEngContractFactory Factory;

    bytes32 public name;
    uint256 public deadline;
    uint256 public stake;
    uint256 public fee;

    string public dataHash;
    string public respHash;
    bytes32 public secretHash;

    bool active;
    bool claimed;
    bool validating;

    event Deployed(address indexed _req, uint256 value, string _data, uint256 _timestamp);
    event Claimed(address indexed _req, address indexed _eng, uint256 value, uint256 _timestamp);
    event Validated(address indexed _req, address indexed _eng, address indexed _val, uint256 value, uint256 _timestamp);
    event Failed(address indexed _req, address indexed _eng, address indexed _val, uint256 value, uint256 _timestamp);
    event Deadline(address indexed _req, uint256 value, uint256 _timestamp);

    function ReqEngContract(address _req, address _onyx, address _validators, address _factory, bytes32 _name, uint256 _deadline, string _dataHash, bytes32 _secretHash) {
    	Requester = _req;
    	Onyx = OnyxToken(_onyx);
    	Validators = ValidatorNetwork(_validators);
        Factory = ReqEngContractFactory(_factory);
	   	stake = Onyx.stake();
	   	fee = Onyx.fee();
        name = _name;
        dataHash = _dataHash;
    	active = false;
    	claimed = false;
    	deadline = _deadline;
        validating = false;
        secretHash = _secretHash;
    }

    /**
    * @dev Transfers stake and ether to be tranferred to the contract if approval is given
    */
    function deploy() onlyOwner payable returns (bool) {
        require(Onyx.balanceOf(this) == stake);
    	active = true;
    	Deployed(Requester, this.balance, dataHash, block.timestamp);
    	return active;
    }

    function isActive() constant returns (bool) {
        return active;
    }

    function isClaimed() constant returns (bool) {
        return claimed;
    }

    function getDeadline() constant returns (uint256) {
        return deadline;
    }

    function isValidating() constant returns (bool) {
        return validating;
    }

    modifier isApproved(address addr) {
    	require(Onyx.allowance(addr, this) >= stake);
    	_;
    }

    /**
    * @dev Claims the contract for an Engineer to work on
    */
    function claim() isApproved(msg.sender) returns (bool) {
        require(active && !claimed);
        Onyx.transferFrom(msg.sender, this, stake);
		Engineer = msg.sender;
		claimed = true;
		Claimed(Requester, Engineer, this.balance, block.timestamp);
        Factory.claimContract();
		return true;
    }

    function submit(string _dataHash) returns (bool) {
    	// TODO: Send the code to the validate function
        require(claimed && active && msg.sender == Engineer);
        if(validating == false) {
            validating = true;
            respHash = _dataHash;
            Validators.validate(_dataHash);
        }
        return validating;
    }

    function callDeadline() onlyOwner returns (bool) {
        require(block.timestamp >= deadline && validating == false);
        if(active) {
            Onyx.transfer(Requester, stake);
        }
        if(claimed) {
            Onyx.transfer(Engineer, stake);
        }
        Deadline(Requester, this.balance, block.timestamp);
        Factory.deadlineContract();
        selfdestruct(Requester);
        return true;
    }

    function feedback(bytes32 _passPhrase, address _validator) returns (bool) {
        Validator = _validator;
    	if(secretHash == _passPhrase) {
    		Onyx.transfer(Requester, stake);
            Onyx.transfer(Engineer, stake);
            Validated(Requester, Engineer, Validator, this.balance, block.timestamp);
            Factory.validateContract();
            selfdestruct(Engineer);
   		} else {
            validating = false;
            Failed(Requester, Engineer, Validator, this.balance, block.timestamp);
            Factory.failContract();
        }
    }
}