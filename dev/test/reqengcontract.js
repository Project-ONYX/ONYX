'use strict';
import {advanceBlock} from './helpers/advanceToBlock';

var ReqEngContract = artifacts.require("./ReqEngContract.sol");
var ValidatorNetwork = artifacts.require("./ValidatorNetwork.sol");
var OnyxToken = artifacts.require("./OnyxToken.sol");
const assertJump = require('./helpers/assertJump');

contract('ReqEngContract', function(accounts) {
	let onyx;
	let valNet;
	let reContract;

	beforeEach(async function() {
		onyx = await OnyxToken.new(20, 20, 10, 1, 10);
		valNet = await ValidatorNetwork.new(onyx.address);
		await onyx.mint(accounts[0], 1000);
		reContract = await ReqEngContract.new(accounts[0], onyx.address, valNet.address, web3.eth.blockNumber + 20);
	});

	it("should fail at transferring stake", async function() {
		try {
			let stake = await onyx.getStake();
			await reContract.transferStake({value: 100});
			assert.fail("Should have failed");
		} catch(error) {
			assertJump(error);
		}
	});

	it("should succeed at transferring stake", async function() {
		let stake = await onyx.getStake();
		await onyx.approve(reContract.address, stake.toNumber(), {from: accounts[0]});
		await reContract.transferStake({value: 100});
		let activation = await reContract.isActive.call();
		assert.isTrue(activation);
	});

	it("should claim a contract", async function() {
		await onyx.mint(accounts[1], 1000);
		let stake = await onyx.getStake();
		await onyx.approve(reContract.address, stake.toNumber(), {from: accounts[0]});
		await reContract.transferStake({from: accounts[0], value: 100});
		await onyx.approve(reContract.address, stake.toNumber(), {from: accounts[1]});
		await reContract.claim({from: accounts[1]});
		let claimed = await reContract.isClaimed.call();
		assert.isTrue(claimed);
	});

	it("should fail at calling deadline", async function() {
		try {
			await reContract.callDeadline({from: accounts[0]});
		} catch(error) {
			assertJump(error);
		}
	});

	it("should succeed at calling deadline", async function() {
		let endBlock = await reContract.getDeadline.call();
		while(web3.eth.blockNumber <= endBlock) {
			await advanceBlock();
		}
		let stake = await onyx.getStake();
		await onyx.approve(reContract.address, stake.toNumber(), {from: accounts[0]});
		await reContract.transferStake({from: accounts[0], value: 100});
		let origReqBalance = await onyx.balanceOf.call(accounts[0]);
		await reContract.callDeadline({from: accounts[0]});
		let reqBalance = await onyx.balanceOf.call(accounts[0]);
		let dead = await reContract.owner.call();
		assert.isTrue(dead === "0x");
		assert.equal(origReqBalance.toNumber(), 990);
		assert.equal(reqBalance.toNumber(), 1000);
	});
})