pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import '../lib/Ownable.sol';
import './RefundVault.sol';
import '../token/OnyxToken.sol';

/**
* @title MilestoneVault
* @dev This contract is used for storing funds while a crowdsale
* is in progress. Supports refunding the money if crowdsale fails,
* and forwarding it if crowdsale is successful. Also supports the
* releasing of funds according to milestone voting from a token.
*/
contract MilestoneVault is RefundVault, Ownable {
    using SafeMath for uint256;

    enum State { Active, Refunding, Closed }
    // Finish funding levels Implementation in array not enum 

    mapping (address => uint256) public deposited;
    address public wallet;
    OnyxToken public token;
    State public state;
    FundingLevels public completedFundingState;
    uint256 public totalBalance;

    mapping (FundingLevels => uint) public levels;
    levels[FundingLevels.L0] = 0;
    levels[FundingLevels.L1] = 50;
    levels[FundingLevels.L2] = 50;
    levels[FundingLevels.L3] = 100;

    event L1();
    event L2();
    event L3();
    event Closed();
    event RefundsEnabled();
    event Refunded(address indexed beneficiary, uint256 weiAmount);

    function MilestoneVault(address _wallet, address _token) {
        require(_wallet != 0x0);
        wallet = _wallet;
        token = OnyxToken(_token);
        state = State.Active;
        completedFundingState = FundingLevels.L0;
    }

    function deposit(address investor) onlyOwner payable {
        require(state == State.Active);
        deposited[investor] = deposited[investor].add(msg.value);
        totalBalance = totalBalance.add(msg.value);
    }

    function close() onlyOwner {
        require(state == State.Active);
        state = State.Closed;
        Closed();
        wallet.transfer(this.balance);
    }

    function getCurrentMilestone() onlyOwner returns (FundingLevels) {
        // Finish Implementation when Milestones is implemented for ONYX token
    }

    function extractFunds() onlyOwner {
        require(state != State.Active && state != State.Refunding);
        FundingLevels currentLevel = getCurrentMilestone();
    }

    function enableRefunds() onlyOwner {
        require(state == State.Active);
        state = State.Refunding;
        RefundsEnabled();
    }

    function refund(address investor) {
        require(state == State.Refunding);
        uint256 depositedValue = deposited[investor];
        deposited[investor] = 0;
        investor.transfer(depositedValue);
        Refunded(investor, depositedValue);
    }
}