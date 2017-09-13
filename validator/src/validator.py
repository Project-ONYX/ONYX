import sys
import os
import unittest

# Helper Class that has the job of running all the tests for the
# ValidatorListener class
class Validator:
    def __init__(self, test_path):
        self.path = test_path

    # Validates an entire testing file
    def validate(self):
        sys.path.append(self.path)
        from tests import getTests
        test_suite = getTests()
        result_key = self.run_tests(test_suite)
        return result_key

    # Runs all the unit tests for a job
    def run_tests(self, test_suite):
        result = unittest.TextTestRunner(verbosity=0,stream = open(os.devnull, 'w')).run(test_suite)
        result_key = ""
        if(result.wasSuccessful()):
            f = open(self.path + "secret_key","r")
            result_key = f.read()
            f.close()
        else:
            result_key = "FAILED " + str(len(result.failures)) + " OUT OF " + str(result.testsRun)
        return result_key