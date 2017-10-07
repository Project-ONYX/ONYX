pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import '../lib/Ownable.sol';
import './ReqEngContract.sol';
import '../token/OnyxToken.sol';

/**
 * @title ReqEngContractFactory
 * @dev Smart Contract in charge of dealing with the contracts
 * generated between a requester and engineer. Serves as central event
 * transmitter to be listened to.
 */
contract ReqEngContractFactory {
    using SafeMath for uint256;

    mapping(address => uint256) outstandingContracts;
    address onyx;
    address valNet;
    uint256 public numRequests = 0;

    event NewContract(address indexed _contract, address indexed _req, bytes32 _name, uint256 value, uint256 _deadline, string _dataHash, uint256 _timestamp);
    event Claimed(address indexed _contract, address indexed _req, address indexed _eng, uint256 value, uint256 _deadline, bytes32 _name, uint256 _timestamp);
    event Validated(address indexed _contract, address indexed _req, address indexed _eng, address _val, uint256 value, uint256 _deadline, bytes32 _name, uint256 _timestamp);
    event Failed(address indexed _contract, address indexed _req, address indexed _eng, address _val, uint256 value, uint256 _deadline, bytes32 _name, uint256 _timestamp);
    event Deadlined(address indexed _contract, address indexed _req, uint256 value, uint256 _deadline,  bytes32 _name, uint256 _timestamp);

    function ReqEngContractFactory(address _onyx, address _validators) {
    	onyx = _onyx;
        valNet = _validators;
    }

    modifier isApproved(address addr) {
        require(OnyxToken(onyx).allowance(addr, this) >= OnyxToken(onyx).stake());
        _;
    }

    /**
    * @dev Inits a new ReqEngContract to represent a new request
    * @param _name job name
    * @param _deadline job deadline in unix time
    * @param _dataHash hash for the storage location of the starter code/setup
    * @param _secretHash hashed passcode value that is used as confirmation of validator success
    */
    function newContract(bytes32 _name, uint256 _deadline, string _dataHash, bytes32 _secretHash) isApproved(msg.sender) payable returns (address) {
        address req = msg.sender;
        address contractAddr = new ReqEngContract(req, onyx, valNet, this, _name, _deadline, _dataHash, _secretHash);
        OnyxToken(onyx).transferFrom(req, contractAddr, OnyxToken(onyx).stake());
        ReqEngContract(contractAddr).deploy.value(msg.value)();
        ReqEngContract(contractAddr).transferOwnership(req);
        outstandingContracts[contractAddr] += 1;
        numRequests += 1;
        NewContract(contractAddr, req, _name, msg.value, _deadline, _dataHash, block.timestamp);
        return contractAddr;
    }

    /**
    * @dev Acts as an event emitter to emit Claimed event for front end
    */
    function claimContract() returns (bool) {
        address _contract = msg.sender;        
        require(outstandingContracts[_contract] > 0);  
        ReqEngContract reContract = ReqEngContract(_contract);
        Claimed(_contract, reContract.Requester(), reContract.Engineer(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        return true;
    }

    /**
    * @dev Acts as an event emitter to emit the Validated event for front end.
    *      Also decrements contract counter for the account.
    */
    function validateContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Validated(_contract, reContract.Requester(), reContract.Engineer(), reContract.Validator(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        outstandingContracts[_contract] -= 1;
        numRequests -= 1;
        return true;
    }

    /**
    * @dev Acts as an event emitter to emit the Failed event for front end
    */
    function failContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Failed(_contract, reContract.Requester(), reContract.Engineer(), reContract.Validator(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        return true;
    }

    /**
    * @dev Acts as an event emitter to emit the Deadlined event for front end.
    *      Also decrements contract counter for the account.
    */
    function deadlineContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Deadlined(_contract, reContract.Requester(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        outstandingContracts[_contract] -= 1;
        numRequests -= 1;
        return true;
    }
}