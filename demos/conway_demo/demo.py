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
		for i in range(numSteps):
			self.doStep()
			if(verbose):
				self.printBoard()

	def doStep(self):
		tempBoard = [[0]*self.boardSize for i in range(self.boardSize)]
		for r in range(self.boardSize):
			for c in range(self.boardSize):
				tempBoard[r][c] = self.processNeighbors(r, c)
		self.board = tempBoard

	def processNeighbors(self, r, c):
		newValue = self.board[r][c]
		alive = False
		if(self.board[r][c] == 1):
			alive = True
		neighborCount = 0
		for i in range(r-1, r+2):
			for j in range(c-1, c+2):
				if(i == r and j == c):
					next
				elif(i < 0 or i >= self.boardSize or j < 0 or j >= self.boardSize):
					next
				elif(self.board[i][j] == 1):
					neighborCount += 1
		if(alive and neighborCount < 2):
			newValue = 0
		elif(alive and neighborCount > 3):
			newValue = 0
		elif(alive and (neighborCount == 2 or neighborCount == 3)):
			newValue = 1
		elif(not alive and neighborCount == 3):
			newValue = 1
		else:
			newValue = self.board[r][c]
		return newValue

	def printBoard(self):
		for r in range(self.boardSize):
			for c in range(self.boardSize):
				if(self.board[r][c] == 0):
					print("O ",end='')
				else:
					print("X ",end='')
			print("")
		print("="*int(self.boardSize*1.5))