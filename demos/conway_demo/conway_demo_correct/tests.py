import unittest
from demo import ConwayDemo
import os

class ConwayTests(unittest.TestCase):
    def setUp(self):
        self.boardSize = 20
        self.board = [[0]*self.boardSize for i in range(self.boardSize)]

    def testSize(self):
        self.conway = ConwayDemo(self.boardSize, initBoard=self.board)
        assert len(self.conway.board) == self.boardSize, 'incorrect board size'
        assert len(self.conway.board[0]) == self.boardSize, 'incorrect board size'
        assert self.conway.boardSize == self.boardSize, 'incorrect board size'

    def testNeighborRule1(self):
        center = int(self.boardSize/2)
        self.board[center][center] = 1
        self.board[center][center+1] = 1
        self.conway = ConwayDemo(self.boardSize, initBoard=self.board)
        self.conway.run(1, verbose=False)
        assert self.conway.board[center][center] == 0, 'Rule 1 Violated'
        assert self.conway.board[center][center+1] == 0, 'Rule 1 Violated'

    def testNeighborRule2(self):
        center = int(self.boardSize/2)
        self.board[center][center] = 1
        self.board[center][center+1] = 1
        self.board[center][center-1] = 1
        self.board[center][center+2] = 1
        self.board[center+1][center+2] = 1
        self.conway = ConwayDemo(self.boardSize, initBoard=self.board)
        self.conway.run(1, verbose=False)
        assert self.conway.board[center][center] == 1, 'Rule 2 Violated'
        assert self.conway.board[center][center+2] == 1, 'Rule 2 Violated'
        assert self.conway.board[center+1][center+2] == 1, 'Rule 2 Violated'
        assert self.conway.board[center][center+1] == 1, 'Rule 2 Violated'

    def testNeighborRule3(self):
        center = int(self.boardSize/2)
        self.board[center][center] = 1
        self.board[center][center+1] = 1
        self.board[center+1][center] = 1
        self.board[center][center-1] = 1
        self.board[center-1][center] = 1
        self.conway = ConwayDemo(self.boardSize, initBoard=self.board)
        self.conway.run(1, verbose=False)
        assert self.conway.board[center][center] == 0, 'Rule 3 Violated'

    def testNeighborRule4(self):
        center = int(self.boardSize/2)
        self.board[center][center] = 0
        self.board[center][center+1] = 1
        self.board[center+1][center] = 1
        self.board[center-1][center] = 1
        self.conway = ConwayDemo(self.boardSize, initBoard=self.board)
        self.conway.run(1, verbose=False)
        assert self.conway.board[center][center] == 1, 'Rule 4 Violated'

def getTests():
    suite = unittest.TestLoader().loadTestsFromTestCase(ConwayTests)
    return suite

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(ConwayTests)
    result = unittest.TextTestRunner(verbosity=0,stream = open(os.devnull, 'w')).run(suite)
    if(result.wasSuccessful()):
        f = open("secret_key","r")
        key = f.read()
        print(key)
        f.close()
    else:
        print("FAILED " + str(len(result.failures)) + " OUT OF " + str(result.testsRun) + ":")
        for test in result.failures:
            print("    " + str(test[0]))