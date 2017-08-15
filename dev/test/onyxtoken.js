var OnyxToken = artifacts.require("./OnyxToken.sol");

contract('OnyxToken', function(accounts) {
  var onyx;
  it("should put 10000 OnyxToken in the first account", function() {
    return OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      return onyx.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });

  it("should transfer coin correctly", function() {
    var onyx;

    //    Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    return OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      return onyx.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return onyx.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return onyx.transfer(account_two, amount, {from: account_one});
    }).then(function() {
      return onyx.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return onyx.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

  it("should call for vote", function() {
    var onyx;
    var account = accounts[0];
    var balance = 10000;
    var numVotesCalled;
    var didCallVote;

    return OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      return onyx.callVote("Stake", {from: account});
    }).then(function() {
      return onyx.balanceOf.call(account);
    }).then(function(account_balance) {
      balance = account_balance;
      return onyx.getVotesCalled.call("Stake");
    }).then(function(votesCalled) {
      numVotesCalled = votesCalled.toNumber();
      return onyx.hasCalledVote.call(account, "Stake");7
    }).then(function(calledVote) {
      didCallVote = calledVote;

      assert.equal(numVotesCalled, balance, "Vote Call amount wasn't set properly");
      assert.isTrue(didCallVote, "HasCalledVote returns incorrect value");
    });
  });

  it("should transfer a vote call", function() {
    var onyx;
    var account_one = accounts[0];
    var account_two = accounts[1];
    var balance;
    var newVotesCalled;
    var amount = 100;

    return OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      return onyx.transfer(account_two, amount, {from: account_one});
    }).then(function() {
      return onyx.balanceOf.call(account_one);
    }).then(function(new_balance) {
      balance = new_balance.toNumber();
      return onyx.getVotesCalled.call("Stake");
    }).then(function(votesCalled) {
      newVotesCalled = votesCalled.toNumber();

      assert.equal(newVotesCalled, balance, "Vote Calls were not transferred properly during transfer");
    });
  });
});
