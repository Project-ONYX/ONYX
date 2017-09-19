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
        uint256 index;
    }

    mapping(address => Validator) validators;
    mapping(uint256 => address) valList;

    uint256 maxIndex = 0;

    event RandNum(uint256 _val);
    event NewValidator(address indexed _val);
    event DeleteValidator(address indexed _val);
    event Validate(address indexed _val, string _dataHash, address _job);
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
            validators[msg.sender] = Validator(true, stake, 0, maxIndex);
            valList[maxIndex] = msg.sender;
            maxIndex = maxIndex.add(1);
            NewValidator(msg.sender);
            return true;
        } else {
            return false;
        }
    }

    function deleteValidator() returns (bool) {
        if(validators[msg.sender].init == true) {
            Onyx.transfer(msg.sender, stake);
            uint256 idx = validators[msg.sender].index;
            if(maxIndex > 1) {
                address temp = valList[maxIndex-1];
                valList[idx] = temp;
                validators[temp].index = idx;
                maxIndex = maxIndex.sub(1);
            } else {
                delete valList[idx];
                maxIndex = 0;
            }
            delete validators[msg.sender];
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
        uint256 randNum = uint256(sha3(block.timestamp))%maxIndex;
        RandNum(randNum);
        return valList[randNum];
    }

    function validate(string _dataHash) returns (address) {
        address randomValidatorAddress = getRandomValidator();
        Validator randomValidator = validators[randomValidatorAddress];
        randomValidator.currentAssignment = msg.sender;
        Validate(randomValidatorAddress, _dataHash, msg.sender);
        return randomValidatorAddress;
    }

    function endValidation(bool _passed) returns (bool) {
        ReqEngContract reqContract = ReqEngContract(validators[msg.sender].currentAssignment);
        Validated(msg.sender, validators[msg.sender].currentAssignment);
        validators[msg.sender].currentAssignment = 0;
        reqContract.feedback(_passed, msg.sender);
        return true;
    }
}