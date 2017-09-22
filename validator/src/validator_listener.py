import sys
import os
import argparse
import atexit
import requests
import shutil
import zipfile
from validator import Validator
from web3 import Web3, HTTPProvider
from contract import ContractHelper

# Class designed to open up a listener and wait for validation requests
# from the blockchain.
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
		self.val_net = self.web3.eth.contract(abi=ContractHelper.getABI('ValidatorNetwork'), address=self.valnet_address)
		self.onyx = self.web3.eth.contract(abi=ContractHelper.getABI('OnyxToken'), address=self.val_net.call().Onyx())
		self.listener = self.init_listener()

	# Registers the wallet address as an active validator
	def new_validator(self):
		if(not self.active):
			stake = self.onyx.call().stake()
			self.onyx.transact({"from":self.wallet}).approve(self.valnet_address, 0)
			if(self.onyx.call({"from":self.wallet}).allowance(self.wallet, self.valnet_address) == 0):
				self.onyx.transact({"from":self.wallet}).approve(self.valnet_address, stake)

			if(self.onyx.call({"from":self.wallet}).allowance(self.wallet, self.valnet_address) == stake):
				self.val_net.transact({"from":self.wallet}).newValidator()
			self.start_listener()
			self.active = True

	# Deletes the wallet address as an active validator
	def delete_validator(self):
		if(self.active):
			self.val_net.transact({"from":self.wallet}).deleteValidator()
			self.stop_listener()
			self.active = False

	# Retrieves the ONYX balance of the wallet address
	def get_balance(self):
		return self.onyx.call().balanceOf(self.wallet)

	# Instantiates the listener
	def init_listener(self):
		return self.val_net.on("Validate",{"fromBlock":"latest", "filter":{"_val":self.wallet}})

	# Starts watching the listener for calls for validation
	def start_listener(self):
		self.listener.watch(self.validation_call)
		print("Listening for Validation call...")

	# Stops watching the listener for calls for validation
	def stop_listener(self):
		self.listener.stop_watching()
		self.listener = self.init_listener()
		print("Stopped listening for Validation call...")

	# Callback function ran when the listener hears a call
	def validation_call(self, log_entry):
		if(self.active):
			job = log_entry["args"]["_job"]
			data = log_entry["args"]["_dataHash"]
			print("NEW JOB: " + job)
			print("DataHash: " + data)
			re_contract = self.web3.eth.contract(abi=ContractHelper.getABI('ReqEngContract'), address=job)
			self.validate(re_contract, data)

	# Downloads and Runs test cases for the validation job
	# Also writes results back to the blockchain
	# Creates and deletes all directories required for the testing
	def validate(self, re_contract, data):
		if not os.path.exists(self.download_path):
			os.makedirs(self.download_path)
		file_id = data
		file_path = self.download_files(file_id)
		val = Validator(file_path)
		return_key = val.run_tests()
		passed = ""
		if "FAILED" not in return_key:
			passed = return_key
		else:
			passed = ""
		print("Passed: " + str(passed))
		self.val_net.transact({"from":self.wallet}).endValidation(passed)
		try:
			shutil.rmtree(self.download_path)
		except OSError as e:
			print("ERROR: " + e.filename + " - " + e.strerror)

	# Helper function to download files into the correct directory
	def download_files(self, file_id):
		url = "http://localhost:3001/api/files/" + str(file_id)
		r = requests.get(url, allow_redirects=True)
		fileName = self.download_path + str(file_id) + ".zip"
		open(fileName, 'wb').write(r.content)
		return self.unzip_files(fileName)

	# Helper function to unzip downloaded files
	def unzip_files(self, file_path):
		zip_ref = zipfile.ZipFile(file_path, 'r')
		zip_ref.extractall(self.download_path )
		zip_ref.close()
		return self.download_path


# Command line utility for starting and stopping validation
# start: starts the listener and validator
# stop: stops the listener and validator but doesn't exit
# quit: stops the listener and validator and exits the script
if __name__=="__main__":
	parser = argparse.ArgumentParser("Validator Listener")
	parser.add_argument("--valnet_address", dest="valnet_address", help="The address of the Validation Network on the Ethereum Network")
	parser.add_argument("--wallet_address", dest="wallet_address", default="", help="The address of the User Wallet on the Ethereum Network")
	parser.add_argument("--download_path", dest="download_path", default="", help="The path for the downloaded files")
	args = parser.parse_args()

	valnet_address = args.valnet_address
	wallet_address = args.wallet_address
	download_path = args.download_path
	validator = ValidatorListener(valnet_address,wallet_address,download_path)

	# Cleanup code for when a hard exit is committed
	# Cleans up the validator so that it deletes itself on the blockchain
	def cleanup():
		if(validator.active):
			validator.delete_validator()
	atexit.register(cleanup)

	# Looping shell that listens for start, stop, and quit
	keep_going = True
	while(keep_going):
		user_input = input(">")
		if(user_input == "start"):
			validator.new_validator()
		if(user_input == "stop"):
			validator.delete_validator()
		if(user_input == "balance"):
			print(validator.get_balance())
		if(user_input == "quit"):
			validator.delete_validator()
			keep_going = False
