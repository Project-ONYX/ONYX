import sys
import os
import unittest
from validator import Validator
from web3 import Web3, HTTPProvider
from contract import ContractHelper

class ValidatorListener:
	def __init__(self, valnet_address, wallet_address, download_path):
		self.valnet_address = valnet_address
		self.download_path = download_path
		self.active = False
		self.web3 = Web3(HTTPProvider('http://localhost:8545'))
		if (wallet_address == ""):
			self.wallet = self.web3.eth.accounts[0]
		else:
			self.wallet = wallet_address
		self.valNet = self.web3.eth.contract(abi=ContractHelper.getABI('ValidatorNetwork'), address=self.valnet_address)
		self.onyx = self.web3.eth.contract(abi=ContractHelper.getABI('OnyxToken'), address=self.valNet.call().Onyx())

	def newValidator(self):
		if(not self.active):
			stake = self.onyx.call().stake()
			self.onyx.transact({"from":self.wallet}).approve(self.valnet_address, 0)
			if(self.onyx.call({"from":self.wallet}).allowance(self.wallet, self.valnet_address) == 0):
				self.onyx.transact({"from":self.wallet}).approve(self.valnet_address, stake)

			if(self.onyx.call({"from":self.wallet}).allowance(self.wallet, self.valnet_address) == stake):
				self.valNet.transact({"from":self.wallet}).newValidator()
			self.listen()
			self.active = True

	def deleteValidator(self):
		if(self.active):
			self.valNet.transact({"from":self.wallet}).deleteValidator()
			self.active = False
			print("Stopped listening for Validation calls...")

	def getBalance(self):
		return self.onyx.call().balanceOf(self.wallet)

	def listen(self):
		self.valNet.on("Validate",{"fromBlock":"latest","filter":{"_val":self.wallet}}, self.validationCall)
		print("Listening for Validation call...")

	def validationCall(self, log_entry):
		if(self.active):
			job = log_entry["args"]["_job"]
			print("NEW JOB: " + job)

	def validate(self):
		val = Validator(self.download_path)
		return_key = val.validate()
		print(return_key)

	def download_files(self):
		pass

if __name__=="__main__":
	if(len(sys.argv) < 2):
		print("Usage: python validator_listener.py <VALNET_ADDRESS>")
		exit()
	valnet_address = sys.argv[1]
	validator = ValidatorListener(valnet_address,"","")
	validator.newValidator()
	validator.deleteValidator()