pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import '../lib/Ownable.sol';
import './ReqEngContract.sol';

/**
 * @title ReqEngContractFactory
 * @dev Smart Contract in charge of dealing with
 * the transaction between a requester and engineer.
 * Handles 
 */
contract ReqEngContractFactory {
    using SafeMath for uint256;

    mapping(address => uint256) outstandingContracts;
    address onyx;
    address valNet;

    event NewContract(address indexed _contract, address indexed _req, bytes32 _name, uint256 _deadline, string _dataHash, uint256 _timestamp);
    event Deployed(address indexed _contract, address indexed _req, uint256 value, uint256 _deadline, bytes32 _name, uint256 _timestamp);
    event Claimed(address indexed _contract, address indexed _req, address indexed _eng, uint256 value, uint256 _deadline, bytes32 _name, uint256 _timestamp);
    event Validated(address indexed _contract, address indexed _req, address indexed _eng, address _val, uint256 value, uint256 _deadline, bytes32 _name, uint256 _timestamp);
    event Failed(address indexed _contract, address indexed _req, address indexed _eng, address _val, uint256 value, uint256 _deadline, bytes32 _name, uint256 _timestamp);
    event Deadlined(address indexed _contract, address indexed _req, uint256 value, uint256 _deadline,  bytes32 _name, uint256 _timestamp);

    function ReqEngContractFactory(address _onyx, address _validators) {
    	onyx = _onyx;
        valNet = _validators;
    }

    function newContract(bytes32 _name, uint256 _deadline, string _dataHash, bytes32 _secretHash) returns (address) {
        address req = msg.sender;
        address contractAddr = new ReqEngContract(req, onyx, valNet, this, _name, _deadline, _dataHash, _secretHash);
        ReqEngContract(contractAddr).transferOwnership(req);
        outstandingContracts[contractAddr] += 1;
        NewContract(contractAddr, req, _name, _deadline, _dataHash, block.timestamp);
        return contractAddr;
    }

    function deployContract() returns (bool) {
        address _contract = msg.sender;        
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Deployed(_contract, reContract.Requester(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        return true;
    }

    function claimContract() returns (bool) {
        address _contract = msg.sender;        
        require(outstandingContracts[_contract] > 0);  
        ReqEngContract reContract = ReqEngContract(_contract);
        Claimed(_contract, reContract.Requester(), reContract.Engineer(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        return true;
    }

    function validateContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Validated(_contract, reContract.Requester(), reContract.Engineer(), reContract.Validator(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        outstandingContracts[_contract] -= 1;
        return true;
    }

    function failContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Failed(_contract, reContract.Requester(), reContract.Engineer(), reContract.Validator(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        return true;
    }

    function deadlineContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Deadlined(_contract, reContract.Requester(), _contract.balance, reContract.deadline(), reContract.name(), block.timestamp);
        return true;
    }
}