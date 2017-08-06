import sys
import os

class Validator:
	def __init__(self, wallet_address):
		self.wallet = wallet_address

	# Listens on the ethereum blockchain for finished code
	# that needs to be validated
	def listen(self):
		pass

	# Validates an entire coding job
	def validate(self):
		pass

	# Runs all the unit tests for a job
	def runTests(self):
		pass

	# Run a single unit test from the list
	def runTest(self):
		pass

	# Download files from IPFS/Server storage
	def downloadFiles(self):
		pass