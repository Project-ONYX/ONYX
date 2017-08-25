var SafeMath = artifacts.require("./SafeMath.sol");
var OnyxToken = artifacts.require("./OnyxToken.sol");
var ValidatorNetwork = artifacts.require("./ValidatorNetwork.sol");
var ReqEngContractFactory = artifacts.require("./ReqEngContractFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, OnyxToken);
  deployer.deploy(OnyxToken, 20, 20, 100, 1, 10).then(function() {
  	deployer.link(SafeMath, ValidatorNetwork);
  	return deployer.deploy(ValidatorNetwork, OnyxToken.address).then(function() {
  		deployer.link(SafeMath, ReqEngContractFactory);
  		return deployer.deploy(ReqEngContractFactory, OnyxToken.address, ValidatorNetwork.address);
  	});
  });
};
