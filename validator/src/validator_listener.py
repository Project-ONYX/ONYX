import sys
import os
import unittest
import requests
import shutil
import zipfile
from validator import Validator
from web3 import Web3, HTTPProvider
from contract import ContractHelper

class ValidatorListener:
	def __init__(self, valnet_address, wallet_address, download_path):
		self.valnet_address = valnet_address
		if(download_path == ""):
			self.download_path = "./job/"
		else:
			self.download_path = download_path
		self.active = False
		self.web3 = Web3(HTTPProvider('http://localhost:8545'))
		if (wallet_address == ""):
			self.wallet = self.web3.eth.accounts[0]
		else:
			self.wallet = wallet_address
		self.valNet = self.web3.eth.contract(abi=ContractHelper.getABI('ValidatorNetwork'), address=self.valnet_address)
		self.onyx = self.web3.eth.contract(abi=ContractHelper.getABI('OnyxToken'), address=self.valNet.call().Onyx())
		self.listener = self.initListener()

	def newValidator(self):
		if(not self.active):
			stake = self.onyx.call().stake()
			self.onyx.transact({"from":self.wallet}).approve(self.valnet_address, 0)
			if(self.onyx.call({"from":self.wallet}).allowance(self.wallet, self.valnet_address) == 0):
				self.onyx.transact({"from":self.wallet}).approve(self.valnet_address, stake)

			if(self.onyx.call({"from":self.wallet}).allowance(self.wallet, self.valnet_address) == stake):
				self.valNet.transact({"from":self.wallet}).newValidator()
			self.startListener()
			self.active = True

	def deleteValidator(self):
		if(self.active):
			self.valNet.transact({"from":self.wallet}).deleteValidator()
			self.stopListener()
			self.active = False

	def getWallet(self):
		return self.wallet

	def getBalance(self):
		return self.onyx.call().balanceOf(self.wallet)

	def initListener(self):
		return self.valNet.on("Validate",{"fromBlock":"latest", "filter":{"_val":self.wallet}})

	def startListener(self):
		self.listener.watch(self.validationCall)
		print("Listening for Validation call...")

	def stopListener(self):
		self.listener.stop_watching()
		print("Stopped listening for Validation call...")

	def validationCall(self, log_entry):
		if(self.active):
			job = log_entry["args"]["_job"]
			print("NEW JOB: " + job)
			reContract = self.web3.eth.contract(abi=ContractHelper.getABI('ReqEngContract'), address=job)
			self.validate(reContract)

	def validate(self, reContract):
		if not os.path.exists(self.download_path):
			os.makedirs(self.download_path)
		fileId = reContract.call().dataHash()
		filePath = self.download_files(fileId)
		val = Validator(filePath)
		return_key = val.validate()
		print(return_key)
		passed = False
		if "FAILED" not in return_key:
			passed = True
		self.valNet.transact({"from":self.wallet}).endValidation(passed)
		try:
			shutil.rmtree(self.download_path)
		except OSError as e:
			print("ERROR: " + e.filename + " - " + e.strerror)

	def download_files(self, fileId):
		url = "http://localhost:3001/api/files/" + str(fileId)
		r = requests.get(url, allow_redirects=True)
		fileName = self.download_path + str(fileId) + ".zip"
		open(fileName, 'wb').write(r.content)
		return self.unzip_files(fileName)

	def unzip_files(self, filePath):
		zip_ref = zipfile.ZipFile(filePath, 'r')
		zip_ref.extractall(self.download_path )
		zip_ref.close()
		return self.download_path

if __name__=="__main__":
	if(len(sys.argv) < 2):
		print("Usage: python validator_listener.py <VALNET_ADDRESS>")
		exit()
	valnet_address = sys.argv[1]
	validator = ValidatorListener(valnet_address,"","")
	validator.newValidator()
