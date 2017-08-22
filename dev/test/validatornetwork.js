'use strict';
import {advanceBlock} from './helpers/advanceToBlock';

var ValidatorNetwork = artifacts.require("./ValidatorNetwork.sol");
var OnyxToken = artifacts.require("./OnyxToken.sol");
const assertJump = require('./helpers/assertJump');

contract('ValidatorNetwork', function(accounts) {
	let onyx;
	let valNet;

	beforeEach(async function() {
		onyx = await OnyxToken.new(20, 20, 10, 1, 10);
		valNet = await ValidatorNetwork.new(onyx.address);
		await onyx.mint(accounts[0], 1000);
	});

	it("should fail at adding Validator to network since not approved", async function()  {
		try {
			await valNet.newValidator({from: accounts[0]});
			assert.fail("should have thrown before");
		} catch(error) {
			assertJump(error);
		}

		try {
			let stake = await onyx.getStake();
			await onyx.approve(valNet.address, stake.toNumber()-1, {from: accounts[0]});
			await valNet.newValidator({from: accounts[0]});
		} catch(error) {
			assertJump(error);
		}
	});

	it("should succeed at adding and deleting Validator from network", async function() {
		let stake = await onyx.getStake();
		await onyx.approve(valNet.address, stake.toNumber(), {from: accounts[0]});
		await valNet.newValidator({from: accounts[0]});
		let stake_held = await valNet.amValidator(accounts[0]);
		let current_balance = await onyx.balanceOf(accounts[0]);
		assert.isTrue(stake_held);
		assert.equal(current_balance.toNumber(), 990);

		await valNet.deleteValidator({from: accounts[0]});
		stake_held = await valNet.amValidator(accounts[0]);
		current_balance = await onyx.balanceOf(accounts[0]);
		assert.isFalse(stake_held);
		assert.equal(current_balance.toNumber(), 1000);
	});

	it("should fail at adding and deleting a Validator twice", async function() {
		let stake = await onyx.getStake();
		await onyx.approve(valNet.address, stake.toNumber(), {from: accounts[0]});
		await valNet.newValidator({from: accounts[0]});
		let stake_held = await valNet.amValidator(accounts[0]);
		let current_balance = await onyx.balanceOf(accounts[0]);
		assert.isTrue(stake_held);
		assert.equal(current_balance.toNumber(), 990);

		await valNet.deleteValidator({from: accounts[0]});
		stake_held = await valNet.amValidator(accounts[0]);
		current_balance = await onyx.balanceOf(accounts[0]);
		assert.isFalse(stake_held);
		assert.equal(current_balance.toNumber(), 1000);

		try {
			await onyx.approve(valNet.address, stake.toNumber(), {from: accounts[0]});
			await valNet.newValidator({from: accounts[0]});
			stake_held = await valNet.amValidator(accounts[0]);
			current_balance = await onyx.balanceOf(accounts[0]);
			assert.fail("Should have failed by now");
		} catch(error) {
			assertJump(error);
		}
	});

	it("should add and delete a Validator twice", async function() {
		let stake = await onyx.getStake();
		await onyx.approve(valNet.address, stake.toNumber(), {from: accounts[0]});
		await valNet.newValidator({from: accounts[0]});
		let stake_held = await valNet.amValidator(accounts[0]);
		let current_balance = await onyx.balanceOf(accounts[0]);
		assert.isTrue(stake_held);
		assert.equal(current_balance.toNumber(), 990);

		await valNet.deleteValidator({from: accounts[0]});
		stake_held = await valNet.amValidator(accounts[0]);
		current_balance = await onyx.balanceOf(accounts[0]);
		assert.isFalse(stake_held);
		assert.equal(current_balance.toNumber(), 1000);

		await onyx.approve(valNet.address, 0, {from: accounts[0]});
		await onyx.approve(valNet.address, stake.toNumber(), {from: accounts[0]});
		await valNet.newValidator({from: accounts[0]});
		stake_held = await valNet.amValidator(accounts[0]);
		current_balance = await onyx.balanceOf(accounts[0]);
		assert.isTrue(stake_held);
		assert.equal(current_balance.toNumber(), 990);

		await valNet.deleteValidator({from: accounts[0]});
		stake_held = await valNet.amValidator(accounts[0]);
		current_balance = await onyx.balanceOf(accounts[0]);
		assert.isFalse(stake_held);
		assert.equal(current_balance.toNumber(), 1000);
	});

	it("should update stake", async function() {
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

	    let endVoteBlock2 = await onyx.getEndVoteBlock();
	    while(web3.eth.blockNumber <= endVoteBlock2) {
	      await advanceBlock();
	    }
	    await onyx.callVote("Stake");
	    let newStake = await onyx.getStake();

	    await valNet.updateStake();
	    let valNetStake = await valNet.getStake();

	    assert.isTrue(votingActive);
	    assert.isTrue(hasVoted);
	    assert.isTrue(!hasNotVoted);
	    assert.equal(newStake.toNumber(), 20, "Stake not set properly in token");
	    assert.equal(valNetStake.toNumber(), 20, "Stake not set properly in valNet");
	});
})