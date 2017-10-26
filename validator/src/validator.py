import sys
import os
import unittest
import subprocess
from subprocess import CalledProcessError, Popen

# Helper Class that has the job of running all the tests for the
# ValidatorListener class
class Validator:
    def __init__(self, test_path):
        self.path = test_path

    # Runs all the unit tests for a job
    def run_tests(self):
        result_key = ""
        try:
            print("installing dependencies...")
            result = Popen(["npm install"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, cwd=self.path)
            result.wait()
            print("running tests...")
            result = Popen(["truffle", "test"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=self.path)
            output = result.stdout.read().decode('utf-8')
            if("passing" in output.split('\n')[-3]):
                f = open(self.path + "secret_key","r")
                result_key = f.read()
                f.close()
        except Exception as e:
            result_key = e.output.decode('utf-8')
        return result_key