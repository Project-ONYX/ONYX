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

    bool active;
    bool claimed;
    bool validating;

    event Deployed(address indexed _req, uint256 value, string _data);
    event Claimed(address indexed _req, address indexed _eng, uint256 value);
    event Validated(address indexed _req, address indexed _eng, address indexed _val, uint256 value);
    event Deadline(address indexed _req, uint256 value);

    function ReqEngContract(address _req, address _onyx, address _validators, address _factory, bytes32 _name, uint256 _deadline, string _dataHash) {
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
    }

    /**
    * @dev Transfers stake and ether to be tranferred to the contract if approval is given
    */
    function transferStake() onlyOwner isApproved payable returns (bool) {
    	Onyx.transferFrom(msg.sender, this, stake);
    	active = true;
    	Deployed(Requester, this.balance, dataHash);
        Factory.deployContract();
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

    modifier isApproved() {
    	require(Onyx.allowance(msg.sender, this) >= stake);
    	_;
    }

    /**
    * @dev Claims the contract for an Engineer to work on
    */
    function claim() isApproved returns (bool) {
        require(active && !claimed);
        Onyx.transferFrom(msg.sender, this, stake);
		Engineer = msg.sender;
		claimed = true;
		Claimed(Requester, Engineer, this.balance);
        Factory.claimContract();
		return true;
    }

    function submit() returns (bool) {
    	// TODO: Send the code to the validate function
        require(claimed && active && msg.sender == Engineer);
        if(validating == false) {
            validating = true;
            Validators.validate();
        }
        return validating;
    }

    function callDeadline() onlyOwner returns (bool) {
        require(block.number >= deadline && validating == false);
        if(active) {
            Onyx.transfer(Requester, stake);
        }
        if(claimed) {
            Onyx.transfer(Engineer, stake);
        }
        Deadline(Requester, this.balance);
        Factory.deadlineContract();
        selfdestruct(Requester);
        return true;
    }

    function feedback(bool _passed, address _validator) returns (bool) {
    	if(_passed) {
            Validator = _validator;
    		Onyx.transfer(Requester, stake);
            Onyx.transfer(Engineer, stake);
            Validated(Requester, Engineer, Validator, this.balance);
            Factory.validateContract();
            selfdestruct(Engineer);
   		} else {
            validating = false;
        }
    }
}