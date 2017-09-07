import json
from web3 import Web3

class ContractHelper:
	BASE_PATH = "../../dev/build/contracts/"

	def getABI(name):
		path = ContractHelper.BASE_PATH + name + ".json"
		abi = json.load(open(path))['abi']
		return abi