# ProjectONYX
Distributed Test Driven Software Development built on the Ethereum blockchain

# Directory Structure

* README.md
* dapp --> Truffle dapp directory.
	* contracts --> All smart contract code
	* src --> All front-end code that hooks into the smart contracts
	* test --> Test suite for all code
* validator --> Python code to start own instance of a validator (very alpha)
	* README.md --> Instructions for starting validator instance
	* src --> All validator python code
* demos --> TDD demos to help you get started with the ecosystem

# What is Project ONYX

Project ONYX aims to leverage the blockchain and test driven development in order to create a software development platform that allows for the outsourcing of development jobs to any engineer on the ONYX network. Essentially, ONYX is a platform that has 3 main pieces:

1. Requesters: Have development work that needs to be completed. Provides test cases that needs to be passed in order to mark the job as successful.
2. Engineers: These are the people that actually pick and choose which jobs from Requesters they want to do and pass the test cases.
3. Validators: These people run software on their system that queries the ONYX network for completed work by the Engineers and validates it against the test cases in order to guarantee compliance with all of the Requesters parameters.

Each of these players gains something from this transaction. The Requester gets working software written for cheap, the Engineers get paid and get to pick exactly what they work on, and the Validators get paid for doing little to no manual work.

# Benefits of Project ONYX

Project ONYX offers many advantages to software development over today's standard.

1. Can offload menial work to ONYX so that expensive software engineers can focus on more complicated architecture/development tasks.
2. Reduces the number of software engineers required to develop a product which saves money.
3. Instead of hiring enough workers to handle busy times and leaving them without work in the more idle times, the supply of workers can scale with the variable demand of work.

# End Vision

The end vision of Project ONYX is a platform that allows software companies to become many times more efficient by focusing on high level design and architecture and leaving implementation to ONYX. Just as Stack Overflow has sparked the open sharing of knowledge between different sectors and companies of the industry, ONYX will enable the sharing of work between everyone in the industry. Taken to its limit, ONYX could change the entire software industry by leading to smaller companies that do the work of the giant behemoth companies of today. In addition to this, ONYX could change what it means to be a software developer by making it so that one can submit work to any companies on ONYX and work entirely at his/her own pace, schedule, and location.

# Benefits of the blockchain

While Project ONYX can be implemented in a classical centralized fashion, we chose to leverage the Ethereum blockchain in order to further drive down costs and limit future maintainence.

1. No middle man so that privacy concerns are mitigated.
2. Trust is guaranteed by code not people.
3. No single point of failure and no downtime.
4. Community controlled platform where prices, fees, and requirements are all decided by the users so that the platform is always listening to its users.
5. Maintainence and running costs are negligible since all code is deployed onto the blockchain not private servers.
