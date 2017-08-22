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
		reContract = await ReqEngContract.new(accounts[0], onyx.address, valNet.address, web3.eth.blockNumber + 100);
	});

	it("should fail at transferring stake", async function() {
		try {
			await reContract.transferStake({value: 100});
			assert.fail("Should have failed");
		} catch(error) {
			assertJump(error);
		}
	});

	it("should succeed at transferring stake", async function() {
		try {
			await reContract.transferStake({value: 100});
			assert.fail("Should have failed");
		} catch(error) {
			assertJump(error);
		}
	});
})