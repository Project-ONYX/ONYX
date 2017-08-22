pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import '../token/OnyxToken.sol';
import '../lib/Ownable.sol';
import './ValidatorNetwork.sol';

/**
 * @title ReqEngContract
 * @dev Smart Contract in charge of dealing with
 * the transaction between a requester and engineer.
 * Handles 
 */
contract ReqEngContract is Ownable {
    using SafeMath for uint256;

    address Requester;
    address Engineer;
    address Validator;

    OnyxToken Onyx;
    ValidatorNetwork Validators;

    uint256 deadline;
    uint256 stake;
    uint256 fee;

    bool active;
    bool claimed;
    bool validating;

    event Deployed(address indexed _req, uint256 value);
    event Claimed(address indexed _req, address indexed _eng, uint256 value);
    event Validated(address indexed _req, address indexed _eng, address indexed _val, uint256 value);

    function ReqEngContract(address _req, address _onyx, address _validators, uint256 _deadline) {
    	Requester = _req;
    	Onyx = OnyxToken(_onyx);
    	Validators = ValidatorNetwork(_validators);
	   	stake = Onyx.getStake();
	   	fee = Onyx.getFee();
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
    	Deployed(Requester, this.balance);
    	return active;
    }

    function isActive() constant returns (bool) {
        return active;
    }

    modifier isApproved() {
    	require(Onyx.allowance(msg.sender, this) >= stake);
    	_;
    }

    /**
    * @dev Claims the contract for an Engineer to work on
    */
    function claim() isApproved returns (bool) {
    	if(!claimed) {
            Onyx.transferFrom(msg.sender, this, stake);
    		Engineer = msg.sender;
    		claimed = true;
    		Claimed(Requester, Engineer, this.balance);
    		return true;
    	}
    	return false;
    }

    function submit() returns (bool) {
    	// TODO: Send the code to the validate function
        if(validating == false) {
            validating = true;
            Validators.validate();
        }
    }

    function callDeadline() onlyOwner returns (bool) {
        if(block.number >= deadline && validating == false) {
            selfdestruct(Requester);
        }
    }

    function feedback(bool _passed, address _validator) returns (bool) {
    	if(_passed) {
            Validator = _validator;
    		Onyx.transfer(Requester, stake);
            Onyx.transfer(Engineer, stake);
            selfdestruct(Engineer);
   		} else {
            validating = false;
        }
    }
}