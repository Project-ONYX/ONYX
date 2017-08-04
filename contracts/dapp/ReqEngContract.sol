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
contract ReqEngContract Ownable {
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

    event Deployed(address indexed _req, uint256 value);
    event Claimed(address indexed _req, address indexed _eng, uint256 value);

    function ReqEngContract(address _req, address _onyx, address _validators, uint256 _deadline) {
    	Requester = _req;
    	Onyx = OnyxToken(_onyx);
    	Validators = ValidatorNetwork(_validators);
	   	stake = Onyx.getStake();
	   	fee = Onyx.getFee();
    	active = false;
    	claimed = false;
    	deadline = _deadline;
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

    modifier isApproved() {
    	if(Onyx.allowance(msg.sender, this) >= stake) {
    		_;
    	}
    }

    /**
    * @dev Claims the contract for an Engineer to work on
    */
    function claim() returns (bool) {
    	if(!claimed) {
    		Engineer = msg.sender;
    		claimed = true;
    		Claimed(Requester, Engineer, this.balance)
    		return true;
    	}
    	return false;
    }

    function submit() returns (bool) {
    	// TODO: Send the code to the validate function
    	Validator = Validators.validate()
    }

    function feedback(bool _passed) returns (bool) {
    	if(_passed) {
    		Engineer.transfer(this.balance);
    		Onyx.transfer(Requester, stake);
   		}
    }
}