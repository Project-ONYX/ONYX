pragma solidity ^0.4.11;

import '../lib/math/SafeMath.sol';
import '../lib/Ownable.sol';
import './Crowdsale.sol';

/**
 * @title FinalizableCrowdsale
 * @dev Extension of Crowsdale where an owner can do extra work
 * after finishing. By default, it will end token minting.
 */
contract FinalizableCrowdsale is Crowdsale, Ownable {
    using SafeMath for uint256;

    bool public isFinalized;

    event Finalized();

    function FinalizableCrowdsale(uint256 _startBlock, uint256 _endBlock, uint256 _rate, address _wallet) Crowdsale(_startBlock, _endBlock, _rate, _wallet) {
        isFinalized = false;
    }

    // should be called after crowdsale ends, to do
    // some extra finalization work
    function finalize() onlyOwner {
        require(!isFinalized);
        require(hasEnded());

        finalization();
        Finalized();

        isFinalized = true;
    }

    // end token minting on finalization
    // override this with custom logic if needed
    function finalization() internal {
        token.finishMinting();
    }
}