import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import Table from '../components/Table'
import getWeb3 from '../utils/getWeb3'

class Marketplace extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			Factory: "",
			REContract: "",
			tableData: []
		}

		this.getEvents = this.getEvents.bind(this)
		this.handleClaim = this.handleClaim.bind(this)
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
	    const Factory = contract(ReqEngContractFactory)
	    const REContract = contract(ReqEngContract)
	    Onyx.setProvider(this.state.web3.currentProvider)
	    Factory.setProvider(this.state.web3.currentProvider)
	    REContract.setProvider(this.state.web3.currentProvider)
	    this.setState({ Onyx: Onyx })
	    this.setState({ Factory: Factory })
	    this.setState({ REContract: REContract })

	    var factory;
		this.state.web3.eth.getAccounts((error, accounts) => {
		    this.state.Factory.deployed().then((instance) => {
		    	factory = instance
				var claim = factory.Claimed({_eng: accounts[0]}, {fromBlock: "latest"})
				claim.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
				var deploy = factory.Deployed({_req: accounts[0]}, {fromBlock: "latest"})
				deploy.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
		    })
		})

	    this.getEvents()
  	}

  	handleClaim(event) {
		var reContract
		var onyx
		var stake

		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Onyx.deployed().then((instance) => {
				onyx = instance
				onyx.stake.call().then((_stake) => {
					stake = _stake
					onyx.approve(event, stake.toNumber(), {from: accounts[0]}).then(() => {
						this.state.REContract.at(event).then((instance) => {
							reContract = instance
							reContract.claim({from: accounts[0]}).then(() => {
								console.log("Claimed " + event)
							})
						})
					})
				})
			})
		})
  	}

  	getEvents() {
  		this.state.web3.eth.getAccounts((error, accounts) => {
	  		this.state.Factory.deployed().then((instance) => {
	 			let event = instance.Deployed({}, {fromBlock: 0, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				var i = 0
	  				var table = logs.map(log => {
	  					i++
	  					return [
	  						i, 
	  						log.args._contract, 
	  						log.args._req, 
	  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"), 
	  						<button className="button pure-button" onClick={() => this.handleClaim(log.args._contract)}>Claim</button>
	  					]
	  				})
	  				let claimEvent = instance.Claimed({_eng: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
		  			claimEvent.get((error, logs) => {
		  				var j = 0
		  				var claimTable = logs.map(log => {
		  					j++
		  					return [
		  						j, 
		  						log.args._contract, 
		  						log.args._req, 
		  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"), 
		  						<button className="button pure-button" onClick={() => this.handleClaim(log.args._contract)}>Claim</button>
		  					]
		  				})
		  				claimTable = claimTable.reduce((result, filter) => {
						    result[filter[1]] = filter;
						    return result;
						},{})
						table = table.filter(function(entry) {
							return !(entry[1] in claimTable || entry[2] === accounts[0])
						})
		  				this.setState({ tableData: table })
	  				})
	  			})
	  		})
  		})
  	}

	render() {
		var headers = ["#", "Contract", "Requester", "Value", "Claim"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
	        <div className="marketplace">
	        	<h1>Marketplace</h1>
				<Table classes="engineer-table" table={table} />
	        </div>
		)
	}
}

export default Marketplace