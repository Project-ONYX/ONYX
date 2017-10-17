import json
from web3 import Web3

# Helper Class that gives an easy interface to retrieve the ABI
# for any of the smart contracts
class ContractHelper:
	BASE_PATH = "./build/contracts/"

	# Gets the ABI for a contract (not including .json in name)
	def getABI(name):
		path = ContractHelper.BASE_PATH + name + ".json"
		abi = json.load(open(path))['abi']
		return abi