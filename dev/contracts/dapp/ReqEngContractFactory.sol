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

    event NewContract(address indexed _contract, address indexed _req, uint256 _deadline, string _dataHash);
    event Deployed(address indexed _contract, address indexed _req, uint256 value);
    event Claimed(address indexed _contract, address indexed _req, address indexed _eng, uint256 value);
    event Validated(address indexed _contract, address indexed _req, address indexed _eng, address _val, uint256 value);
    event Deadlined(address indexed _contract, address indexed _req, uint256 value);

    function ReqEngContractFactory(address _onyx, address _validators) {
    	onyx = _onyx;
        valNet = _validators;
    }

    function newContract(uint256 _deadline, string _dataHash) returns (address) {
        address req = msg.sender;
        address contractAddr = new ReqEngContract(req, onyx, valNet, this, _deadline, _dataHash);
        ReqEngContract(contractAddr).transferOwnership(req);
        outstandingContracts[contractAddr] = 1;
        NewContract(contractAddr, req, _deadline, _dataHash);
        return contractAddr;
    }

    function deployContract() returns (bool) {
        address _contract = msg.sender;        
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Deployed(_contract, reContract.Requester(), _contract.balance);
        return true;
    }

    function claimContract() returns (bool) {
        address _contract = msg.sender;        
        require(outstandingContracts[_contract] > 0);  
        ReqEngContract reContract = ReqEngContract(_contract);
        Claimed(_contract, reContract.Requester(), reContract.Engineer(), _contract.balance);
        return true;
    }

    function validateContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Validated(_contract, reContract.Requester(), reContract.Engineer(), reContract.Validator(), _contract.balance);
        outstandingContracts[_contract] = 0;
        return true;
    }

    function deadlineContract() returns (bool) {
        address _contract = msg.sender;
        require(outstandingContracts[_contract] > 0);
        ReqEngContract reContract = ReqEngContract(_contract);
        Deadlined(_contract, reContract.Requester(), _contract.balance);
        return true;
    }
}