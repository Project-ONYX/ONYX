var SafeMath = artifacts.require("./SafeMath.sol");
var OnyxToken = artifacts.require("./OnyxToken.sol");
var ValidatorNetwork = artifacts.require("./ValidatorNetwork.sol");
var TradeNetwork = artifacts.require("./TradeNetwork.sol");
var ReqEngContractFactory = artifacts.require("./ReqEngContractFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, OnyxToken);
  deployer.deploy(OnyxToken, 20, 20, 100, 1, 10*1000000000000000000).then(function() {
  	deployer.link(SafeMath, ValidatorNetwork);
  	return deployer.deploy(ValidatorNetwork, OnyxToken.address).then(function() {
  		deployer.link(SafeMath, ReqEngContractFactory);
  		return deployer.deploy(ReqEngContractFactory, OnyxToken.address, ValidatorNetwork.address).then(function() {
  			deployer.link(SafeMath, TradeNetwork);
  			return deployer.deploy(TradeNetwork, OnyxToken.address);
  		});
  	});
  });
};
