pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import './RefundVault.sol';
import '../token/OnyxToken.sol';

/**
* @title MilestoneVault
* @dev This contract is used for storing funds while a crowdsale
* is in progress. Supports refunding the money if crowdsale fails,
* and forwarding it if crowdsale is successful. Also supports the
* releasing of funds in chunks according to a timer.
*/
contract MilestoneVault is RefundVault {
    using SafeMath for uint256;

    mapping (address => uint256) public deposited;
    address public wallet;
    OnyxToken public token;
    State public state;
    uint public completedFundingState;
    uint256 public totalBalance;
    uint256 public extractedBalance;

    struct Level {
        uint percentRelease;
        uint256 blockNum; // Block at which to release level
    }

    Level[4] levels;

    event Milestone(uint level);
    event Closed();
    event RefundsEnabled();
    event Refunded(address indexed beneficiary, uint256 weiAmount);

    function MilestoneVault(address _wallet, address _token) RefundVault(_wallet) {
        require(_wallet != 0x0);
        wallet = _wallet;
        token = OnyxToken(_token);
        state = State.Active;
        completedFundingState = 0;
        levels[0] = Level(0, 0);
        levels[1] = Level(50, 0);
        levels[2] = Level(75, 1000000); // Init with block offsets, go ing for 6 months
        levels[3] = Level(100, 2000000);
    }

    function deposit(address investor) onlyOwner payable {
        require(state == State.Active);
        deposited[investor] = deposited[investor].add(msg.value);
    }

    function close() onlyOwner {
        require(state == State.Active);
        state = State.Closed;
        totalBalance = this.balance;
        extractedBalance = totalBalance;
        for(uint x = 0; x < levels.length; x++) {
            levels[x].blockNum = levels[x].blockNum.add(block.number);
        }
        Closed();
    }

    function getCurrentMilestone() onlyOwner returns (uint) {
        // Finish Implementation when Milestones is implemented for ONYX token
        uint level = 0;
        for(uint x = 0; x < levels.length; x++) {
            if(block.number >= levels[x].blockNum) {
                level = x;
            } else {
                return level;
            }
        }
        return level;
    }

    function extractFunds() onlyOwner returns (bool) {
        require(state == State.Closed);
        uint currentLevel = getCurrentMilestone();
        if(currentLevel > completedFundingState) {
            uint256 removableFunds = totalBalance.mul(levels[currentLevel].percentRelease.div(100)).sub(extractedBalance);
            require(removableFunds <= this.balance);
            wallet.transfer(removableFunds);
            extractedBalance = extractedBalance.add(removableFunds);
            completedFundingState = currentLevel;
            return true;
        } else {
            return false;
        }
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