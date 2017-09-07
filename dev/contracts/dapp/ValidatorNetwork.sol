pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import '../token/OnyxToken.sol';
import './ReqEngContract.sol';

/**
 * @title ValidatorNetwork
 * @dev Creates and manages the validator network
 */
contract ValidatorNetwork is Ownable {
    using SafeMath for uint256;

    OnyxToken public Onyx;
    uint256 public stake;

    struct Validator {
        bool init;
        uint256 stake;
        address currentAssignment;
    }

    mapping(address => Validator) validators;
    mapping(uint256 => address) valList;

    event NewValidator(address indexed _val);
    event DeleteValidator(address indexed _val);
    event Validate(address indexed _val, address _job);
    event Validated(address indexed _val, address _job);

    function ValidatorNetwork(address _onyx) {
        Onyx = OnyxToken(_onyx);
        stake = Onyx.stake();
    }

    modifier isApproved() {
        require(Onyx.allowance(msg.sender, this) >= stake);
        _;
    }

    modifier isValidator() {
        require(validators[msg.sender].init == true);
        _;
    }

    function updateStake() returns (bool) {
        stake = Onyx.stake();
    }

    function newValidator() isApproved returns (bool) {
        if(validators[msg.sender].init == false) {
            Onyx.transferFrom(msg.sender, this, stake);
            validators[msg.sender] = Validator(true, stake, 0);
            NewValidator(msg.sender);
            return true;
        } else {
            return false;
        }
    }

    function deleteValidator() returns (bool) {
        if(validators[msg.sender].init == true) {
            Onyx.transfer(msg.sender, stake);
            validators[msg.sender].init = false;
            DeleteValidator(msg.sender);
            return true;
        }
        else {
            return false;
        }
    }

    function amValidator(address _addr) constant returns (bool) {
        if(validators[_addr].init == true) {
            return true;
        } else {
            return false;
        }
    }

    function getRandomValidator() constant returns (address) {
        // TODO
        return 0;
    }

    function validate() returns (address) {
        address randomValidatorAddress = getRandomValidator();
        Validator randomValidator = validators[randomValidatorAddress];
        randomValidator.currentAssignment = msg.sender;
        Validate(randomValidatorAddress, msg.sender);
        return randomValidatorAddress;
    }

    function endValidation(bool _passed) returns (bool) {
        ReqEngContract regContract = ReqEngContract(validators[msg.sender].currentAssignment);
        Validated(msg.sender, validators[msg.sender].currentAssignment);
        validators[msg.sender].currentAssignment = 0;
        regContract.feedback(_passed, msg.sender);
        return true;
    }
}