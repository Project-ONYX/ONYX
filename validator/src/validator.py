import sys
import os
import unittest
import subprocess
from subprocess import CalledProcessError, check_output

# Helper Class that has the job of running all the tests for the
# ValidatorListener class
class Validator:
    def __init__(self, test_path):
        self.path = test_path

    # Runs all the unit tests for a job
    def run_tests(self):
        result_key = ""
        try:   
            result = check_output(['python','-m','unittest','discover',self.path], stderr=subprocess.STDOUT)
            f = open(self.path + "secret_key","r")
            result_key = f.read()
            f.close()
        except CalledProcessError as e:
            result_key = e.output.decode('utf-8')
        return result_key