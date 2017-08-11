import sys
import os
import unittest
from validator import Validator

class ValidatorListener:
	def __init__(self, wallet_address, download_path):
		self.wallet = wallet_address
		self.download_path = download_path

	def listen(self):
		pass

	def validate(self):
		val = Validator(self.download_path)
		return_key = val.validate()
		print(return_key)

	def download_files(self):
		pass