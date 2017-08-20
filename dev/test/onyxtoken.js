'use strict';
import {advanceBlock} from './helpers/advanceToBlock';

var OnyxToken = artifacts.require("./OnyxToken.sol");
const assertJump = require('./helpers/assertJump');

contract('OnyxToken', function(accounts) {
  let onyx;

  beforeEach(async function() {
    onyx = await OnyxToken.new(20, 20, 10, 1, 10);
    await onyx.mint(accounts[0], 1000);
  });

  it("should start with 1000 OnyxTokens", async function() {
    let totalSupply = await onyx.totalSupply();
    assert.equal(totalSupply, 1000);
  });

  it("should transfer coin correctly", async function() {
    //    Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];
    let amount = 10;

    let account_one_starting_balance = await onyx.balanceOf.call(account_one);
    let account_two_starting_balance = await onyx.balanceOf.call(account_two);
    await onyx.transfer(account_two, amount);
    let account_one_ending_balance = await onyx.balanceOf.call(account_one);
    let account_two_ending_balance = await onyx.balanceOf.call(account_two);

    var expected_amount_one = account_one_starting_balance.toNumber() - amount;
    var expected_amount_two = account_two_starting_balance.toNumber() + amount;

    assert.equal(account_one_ending_balance.toNumber(), expected_amount_one);
    assert.equal(account_two_ending_balance.toNumber(), expected_amount_two);
  });

  it("should throw an error when trying to transfer more than balance", async function() {
    try {
      let transfer = await onyx.transfer(accounts[1], 1001);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  it("should return the correct allowance amount after approval", async function() {
    await onyx.approve(accounts[1], 100);
    let allowance = await onyx.allowance(accounts[0], accounts[1]);

    assert.equal(allowance, 100);
  });

  it("should return correct balances after transferring from another account", async function() {
    await onyx.approve(accounts[1], 100);
    await onyx.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});

    let balance_0 = await onyx.balanceOf(accounts[0]);
    assert.equal(balance_0, 900);

    let balance_1 = await onyx.balanceOf(accounts[2]);
    assert.equal(balance_1, 100);

    let balance_2 = await onyx.balanceOf(accounts[1]);
    assert.equal(balance_2, 0);
  });

  it("should throw an error when trying to transfer more than allowed", async function() {
    await onyx.approve(accounts[1], 99);
    try {
      await onyx.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});
      assert.fail("should have thrown before");
    } catch(error) {
      assertJump(error);
    }
  });

  it("should call for vote", async function() {
    let account = accounts[0];

    await onyx.callVote("Stake", {from: account});
    let balance = await onyx.balanceOf.call(account);
    let numVotesCalled = await onyx.getVotesCalled.call("Stake");
    let didCallVote = await onyx.hasCalledVote.call(account, "Stake");

    assert.equal(numVotesCalled.toNumber(), balance.toNumber());
    assert(didCallVote);
  });

  it("should transfer a vote call", async function() {
    var account_one = accounts[0];
    var account_two = accounts[1];
    let amount = 100;

    await onyx.callVote("Stake", {from: account_one});
    await onyx.transfer(account_two, amount, {from: account_one});
    let balance = await onyx.balanceOf.call(account_one);
    let newVotesCalled = await onyx.getVotesCalled.call("Stake");

    assert.equal(newVotesCalled.toNumber(), balance.toNumber());
  });

  it("should vote and apply vote properly", async function() {
    let account = accounts[0];

    await onyx.callVote("Stake", {from: account});
    let endVoteBlock = await onyx.getEndVoteBlock();
    while(web3.eth.blockNumber <= endVoteBlock) {
      await advanceBlock();
    }
    await onyx.castVote("Stake", 20);
    let votingActive = await onyx.isVotingActive("Stake");
    let hasVoted = await onyx.hasVoted(accounts[0], "Stake");
    let hasNotVoted = await onyx.hasVoted(accounts[1], "Stake");

    await onyx.transfer(accounts[1], 500);

    let endVoteBlock2 = await onyx.getEndVoteBlock();
    while(web3.eth.blockNumber <= endVoteBlock2) {
      await advanceBlock();
    }
    await onyx.callVote("Stake");
    let newStake = await onyx.getStake();

    assert.isTrue(votingActive);
    assert.isTrue(hasVoted);
    assert.isTrue(!hasNotVoted);
    assert.equal(newStake.toNumber(), 15, "Stake not set properly");
  });
});
