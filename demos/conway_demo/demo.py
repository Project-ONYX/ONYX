import numpy.random as random
import os
import time

class ConwayDemo:
	def __init__(self, boardSize, initBoard=None):
		if(initBoard is None):
			self.board = [random.choice([0,1],size=boardSize,p=[0.9,0.1]) for i in range(boardSize)]
		else:
			assert(len(initBoard) == boardSize)
			self.board = initBoard
		self.boardSize = boardSize

	def run(self, numSteps, verbose=True):
		#############################
		#							#
		# ADD IMPLEMENTATION HERE	#
		#							#
		#############################
		return True

	def printBoard(self):
		for r in range(self.boardSize):
			for c in range(self.boardSize):
				if(self.board[r][c] == 0):
					print("O ",end='')
				else:
					print("X ",end='')
			print("")
		print("="*int(self.boardSize*1.5))