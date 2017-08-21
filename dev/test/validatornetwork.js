'use strict';

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

	it("should succeed at adding Validator to network", async function() {
		let stake = await onyx.getStake();
		await onyx.approve(valNet.address, stake.toNumber(), {from: accounts[0]});
		await valNet.newValidator({from: accounts[0]});
		let stake_held = await valNet.amValidator(accounts[0]);
		let current_balance = await onyx.balanceOf(accounts[0]);
		assert.isTrue(stake_held);
		assert.equal(current_balance.toNumber(), 990);
	})
})