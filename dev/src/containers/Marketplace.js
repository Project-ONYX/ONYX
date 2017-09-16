import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import getWeb3 from '../utils/getWeb3'
import Header from '../components/Header'
import DetailedTable from '../components/DetailedTable'

class Marketplace extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			Factory: "",
			REContract: "",
			searchValue: "",
			tableData: []
		}

		this.getEvents = this.getEvents.bind(this)
		this.handleClaim = this.handleClaim.bind(this)
		this.searchChange = this.searchChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
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

	    this.getEvents("")
  	}

  	handleClaim(address, event) {
  		event.preventDefault();

		var reContract
		var onyx
		var stake

		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Onyx.deployed().then((instance) => {
				onyx = instance
				onyx.stake.call().then((_stake) => {
					stake = _stake
					onyx.approve(address, stake.toNumber(), {from: accounts[0]}).then(() => {
						this.state.REContract.at(address).then((instance) => {
							reContract = instance
							reContract.claim({from: accounts[0]}).then(() => {
								console.log("Claimed " + address)
							})
						})
					})
				})
			})
		})
  	}

  	getEvents(filterTerm) {
  		this.state.web3.eth.getAccounts((error, accounts) => {
	  		this.state.Factory.deployed().then((instance) => {
	 			let event = instance.Deployed({}, {fromBlock: 0, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				logs.reverse()
	  				var table = logs.map((log, index) => {
	  					return [
	  						log.args._contract,
	  						this.state.web3.toAscii(log.args._name.replace(/0+$/g, "")),
	  						log.args._req, 
	  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"), 
	  						log.args._deadline.toNumber(),
	  						<button className="button pure-button" onClick={(e) => this.handleClaim(log.args._contract, e)}>Claim</button>
	  					]
	  				})
	  				let claimEvent = instance.Claimed({_eng: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
		  			claimEvent.get((error, logs) => {
		  				var claimTable = logs.map(log => {
		  					return [
		  						log.args._contract,
		  						log.args._name, 
		  						log.args._req,
		  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"), 
		  						log.args._deadline.toNumber()
		  					]
		  				})
		  				claimTable = claimTable.reduce((result, filter) => {
						    result[filter[0]] = filter;
						    return result;
						},{})
						table = table.filter(function(entry) {
							return !(entry[0] in claimTable || entry[2] === accounts[0])
						})
						if(filterTerm !== "") {
							table = table.filter(function(entry) {
								if(entry[1].toLowerCase().indexOf(filterTerm.toLowerCase()) === -1) {
									return false
								} else {
									return true
								}
							})
						}
						table = table.map((entry, index) => {
	  						entry[0] = entry[0].slice(0,20) + "..."
	  						if(entry[1].length > 23) {
	  							entry[1] = entry[1].slice(0,20) + "..."
	  						}
	  						var output_map = {"headers":[entry[1],entry[3] + " ETH"], "vals":[
	  							{"contract": entry[0]},
	  							{"deadline": "Block " + entry[4]},
	  							{"value": entry[3] + " ETH"},
	  							{"claim": entry[5]}
	  						]}
							return output_map
						})
		  				this.setState({ tableData: table })
	  				})
	  			})
	  		})
  		})
  	}

  	searchChange(event) {
  		this.setState({searchValue: event.target.value})
  	}

  	handleSubmit(event) {
		event.preventDefault()
		console.log(this.state.searchValue)
  		this.getEvents(this.state.searchValue)
  	}

	render() {
		var headers = ["Name", "Value"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return(
			<main>
	        	<Header 
	        		text="> Marketplace"
	        	/>
	        	<div className="container engineer-container">
	        		<div className="search-zone">
			        	<form id="searchthis" onSubmit={this.handleSubmit}>
							<input className="search-box" name="query" size="40" type="text" onChange={(this.searchChange)} placeholder="  Search "/>
							<button className="button pure-button search-button" type="submit">Search</button>
						</form>	
					</div>
	        		<DetailedTable classes="requester-table" table={table} />
				</div>
	        </main>
		)
	}
}

export default Marketplace