import getWeb3 from '../utils/getWeb3'
import React, { Component } from 'react'
import Header from '../components/Header'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import TradeNetworkContract from '../../build/contracts/TradeNetwork.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ValidatorNetworkContract from '../../build/contracts/ValidatorNetwork.json'
import Logo from "../../public/logo.svg"

class Home extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			TradeNetwork: "",
			ValidatorNetwork: "",
			REFactory: "",
			numValidators: 0,
			numRequests: 0,
			numONYX: 0,
			numTrades: 0
		}

		this.getValidators = this.getValidators.bind(this)
		this.getRequests = this.getRequests.bind(this)
		this.getONYX = this.getONYX.bind(this)
		this.getTrades = this.getTrades.bind(this)
		this.getEvents = this.getEvents.bind(this)
	}

  	componentWillMount() {
	    getWeb3
	    .then(results => {
	      this.setState({
	        web3: results.web3
	      })

	      // Instantiate contract once web3 provided.
	      this.instantiateContract()
	    })
	    .catch((e) => {
	      console.log('Error finding web3.')
	      console.log(e)
	    })
  	}

  	instantiateContract() {
	    const contract = require('truffle-contract')
	    const Onyx = contract(OnyxTokenContract)
	    const TradeNetwork = contract(TradeNetworkContract)
	    const ValidatorNetwork = contract(ValidatorNetworkContract)
	    const REFactory = contract(ReqEngContractFactory)

	    Onyx.setProvider(this.state.web3.currentProvider)
	    TradeNetwork.setProvider(this.state.web3.currentProvider)
	    ValidatorNetwork.setProvider(this.state.web3.currentProvider)
	    REFactory.setProvider(this.state.web3.currentProvider)

	    this.setState({ Onyx: Onyx })
	    this.setState({ TradeNetwork: TradeNetwork })
	    this.setState({ ValidatorNetwork: ValidatorNetwork })
	    this.setState({ REFactory: REFactory })
		
		var onyx
		var reFactory 
		var valNet
	    var tradeNet

		this.state.web3.eth.getAccounts((error, accounts) => {
		    this.state.TradeNetwork.deployed().then((instance) => {
		    	tradeNet = instance
				var newTrades = tradeNet.NewTrade({}, {fromBlock: "latest"})
				newTrades.watch((error, result) => {
					if (error == null) {
						var numTrades = this.state.numTrades + 1
				  		this.setState({numTrades: numTrades})
					}
				})
		    })
		    this.state.ValidatorNetwork.deployed().then((instance) => {
		    	valNet = instance
				var newValidators = valNet.NewValidator({}, {fromBlock: "latest"})
				newValidators.watch((error, result) => {
					if (error == null) {
						var numValidators = this.state.numValidators + 1
				  		this.setState({numValidators: numValidators})
					}
				})
				var deleteValidators = valNet.DeleteValidator({}, {fromBlock: "latest"})
				deleteValidators.watch((error, result) => {
					if (error == null) {
						var numValidators = this.state.numValidators - 1
				  		this.setState({numValidators: numValidators})
					}
				})
		    })
		    this.state.REFactory.deployed().then((instance) => {
		    	reFactory = instance
				var newContracts = reFactory.NewContract({}, {fromBlock: "latest"})
				newContracts.watch((error, result) => {
					if (error == null) {
						var numRequests = this.state.numRequests + 1
				  		this.setState({numRequests: numRequests})
					}
				})
				var valContracts = reFactory.Validated({}, {fromBlock: "latest"})
				valContracts.watch((error, result) => {
					if (error == null) {
						var numRequests = this.state.numRequests - 1
				  		this.setState({numRequests: numRequests})
					}
				})
				var deadContracts = reFactory.Deadlined({}, {fromBlock: "latest"})
				deadContracts.watch((error, result) => {
					if (error == null) {
						var numRequests = this.state.numRequests - 1
				  		this.setState({numRequests: numRequests})
					}
				})

		    })
		    this.state.Onyx.deployed().then((instance) => {
		    	onyx = instance
				var mintCoins = onyx.Mint({}, {fromBlock: "latest"})
				mintCoins.watch((error, result) => {
					if (error == null) {
						var numONYX = this.state.numONYX + this.state.web3.fromWei(result.args.amount.toNumber(), 'ether')
				  		this.setState({numONYX: numONYX})
					}
				})
		    })
		})
	    this.getEvents()
  	}

  	getEvents() {
  		this.getValidators()
  		this.getRequests()
  		this.getONYX()
  		this.getTrades()
  	}

	getValidators() {
		var valNet
		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.ValidatorNetwork.deployed().then((instance) => {
				valNet = instance
				valNet.maxIndex.call().then((_numValidators) => {
					this.setState({numValidators: _numValidators.toNumber()})
				})
			})
		})
	}

	getRequests() {
		var REFactory
		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.REFactory.deployed().then((instance) => {
				REFactory = instance
				REFactory.numRequests.call().then((_numRequests) => {
					this.setState({numRequests: _numRequests.toNumber()})
				})
			})
		})
	}

	getONYX() {
		var onyx
		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Onyx.deployed().then((instance) => {
				onyx = instance
				onyx.totalSupply.call().then((_supply) => {
					this.setState({numONYX: this.state.web3.fromWei(_supply.toNumber(), 'ether')})
				})
			})
		})
	}

	getTrades() {
		var tradeNet
		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.TradeNetwork.deployed().then((instance) => {
				tradeNet = instance
				tradeNet.indexCounter.call().then((_totalTrades) => {
					this.setState({numTrades: _totalTrades.toNumber()})
				})
			})
		})
	}

	render() {
		return (
	        <main>
	        	<Header 
	        		text="> Home"
	          	/>
	        	<div className="container home-container">
		        	<div className="logo-holder">
			            <img src={Logo} className="logo" alt="logo" />
			            <div className="home-header">Project <strong>ONYX</strong></div>
			            <div className="home-subheader">(Alpha Build)</div>
			        </div>

		        	<div className="pure-g">
					    <div className="pure-u-1 pure-u-md-1-2 stat-box">
					        <div className="stat-data">
					       		{this.state.numValidators} 	
					        </div>
					        <div className="stat-name">
					        	<i className="fa fa-cogs" aria-hidden="true"></i> Online Validators
					        </div>
					    </div>
					    <div className="pure-u-1 pure-u-md-1-2 stat-box">
					        <div className="stat-data">
					        	{this.state.numONYX}
					        </div>
					        <div className="stat-name">
					        	<i className="fa fa-globe" aria-hidden="true"></i> ONYX Token Supply
					        </div>
					    </div>
					</div>

		        	<div className="pure-g">
					    <div className="pure-u-1 pure-u-md-1-2 stat-box">
					        <div className="stat-data">
					        	{this.state.numRequests}
					        </div>
					        <div className="stat-name">
					        	<i className="fa fa-code" aria-hidden="true"></i> Total Requests
					        </div>
					    </div>
					    <div className="pure-u-1 pure-u-md-1-2 stat-box">
					        <div className="stat-data">
					        	{this.state.numTrades}
					        </div>
					        <div className="stat-name">
					        	<i className="fa fa-exchange" aria-hidden="true"></i> ONYX Trades
					        </div>
					    </div>
					</div>
			    </div>
	        </main>
		)
	}
}

export default Home