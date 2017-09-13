import sys
import os
import unittest

class Validator:
    def __init__(self, test_path):
        self.path = test_path

    # Validates an entire testing file
    def validate(self):
        sys.path.append(self.path)
        from tests import getTests
        test_suite = getTests()
        result_key = self.runTests(test_suite)
        return result_key

    # Runs all the unit tests for a job
    def runTests(self, test_suite):
        result = unittest.TextTestRunner(verbosity=0,stream = open(os.devnull, 'w')).run(test_suite)
        result_key = ""
        if(result.wasSuccessful()):
            f = open(self.path + "secret_key","r")
            result_key = f.read()
            f.close()
        else:
            result_key = "FAILED " + str(len(result.failures)) + " OUT OF " + str(result.testsRun)
        return result_key