// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import onyxtoken_artifacts from '../../build/contracts/OnyxToken.json'

// OnyxToken is our usable abstraction, which we'll use through the code below.
var OnyxToken = contract(onyxtoken_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the OnyxToken abstraction for Use.
    OnyxToken.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refresh();
    });

    var onyx;
    OnyxToken.deployed().then(function(instance) {
      var transferEvent = instance.Transfer({from: account});
      transferEvent.watch(function(err, result) {
        if (err) {
          console.log("TRANSFER ERROR")
          console.log(err)
          return;
        }
        console.log("TRANSFER")
        self.refresh();
        // transferEvent.stopWatching()
      })

      var callVoteEvent = instance.CallVote({_owner: account});
      callVoteEvent.watch(function(err, result) {
        if (err) {
          console.log("VOTE CALL ERROR")
          console.log(err)
          return;
        }
        console.log("VOTE CALLED")
        self.refresh();
      })
    })
  },

  refresh: function() {
    var self = this;
    self.refreshBalance();
    self.refreshVotesCalled();
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  callVote: function(message) {
    var self = this;

    var onyx;
    OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      return onyx.callVote("Stake", {from: account});
    }).then(function(value) {
      self.setStatus("Vote Called!");
      self.refresh();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error calling vote; see log.");
    });
  },

  refreshVotesCalled: function() {
    var self = this;

    var onyx;
    OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      return onyx.getVotesCalled.call("Stake", {from: account});
    }).then(function(value) {
      var votes = document.getElementById("VotesCalled");
      votes.innerHTML = "Votes Called: " + value;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting votes called; see log.");
    })
  },

  refreshBalance: function() {
    var self = this;

    var onyx;
    OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      return onyx.balanceOf.call(account, {from: account});
    }).then(function(value) {
      console.log("VALUE: " + value);
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var onyx;
    OnyxToken.deployed().then(function(instance) {
      onyx = instance;
      var ret = onyx.transfer(receiver, amount, {from: account});
      return ret;
    }).then(function(value) {
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/onyxMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 OnyxToken, ensure you've configured that source properly. If using onyxMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-onyxmask")
    // Use Mist/onyxMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to onyxmask for development. More info here: http://truffleframework.com/tutorials/truffle-and-onyxmask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
