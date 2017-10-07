'use strict';
import {advanceBlock} from './helpers/advanceToBlock';

var ReqEngContract = artifacts.require("./ReqEngContract.sol");
var ValidatorNetwork = artifacts.require("./ValidatorNetwork.sol");
var OnyxToken = artifacts.require("./OnyxToken.sol");
var Factory = artifacts.require("./ReqEngContractFactory.sol");
const assertJump = require('./helpers/assertJump');

contract('ReqEngContract', function(accounts) {
	let onyx;
	let valNet;
	let reContract;
	let factory;

	beforeEach(async function() {
		onyx = await OnyxToken.new(20, 20, 10, 1, 10);
		await onyx.mint(accounts[0], 1000);
		valNet = await ValidatorNetwork.new(onyx.address);
		factory = await Factory.new(onyx.address, valNet.address);
		let stake = await onyx.stake.call();
		await onyx.approve(factory.address, stake.toNumber(), {from: accounts[0]});
		reContract = await factory.newContract("name", web3.eth.blockNumber + 20, "3f0s0f903", "key");
		reContract = ReqEngContract.at(reContract.logs[0].args._contract);
	});

	it("should claim a contract", async function() {
		await onyx.mint(accounts[1], 1000);
		let stake = await onyx.stake.call();
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
		let endBlock = await reContract.deadline.call();
		while(web3.eth.blockNumber <= endBlock.toNumber()) {
			await advanceBlock();
		}
		let origReqBalance = await onyx.balanceOf.call(accounts[0]);
		await reContract.callDeadline({from: accounts[0]});
		let reqBalance = await onyx.balanceOf.call(accounts[0]);
		let dead = await reContract.owner.call();
		assert.isTrue(dead === "0x");
		assert.equal(origReqBalance.toNumber(), 990);
		assert.equal(reqBalance.toNumber(), 1000);
	});
})