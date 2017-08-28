import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import Table from '../components/Table'
import getWeb3 from '../utils/getWeb3'

class Pending extends Component {
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
		this.handleDeploy = this.handleDeploy.bind(this)
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
				var newContract = factory.NewContract({_req: accounts[0]}, {fromBlock: "latest"})
				newContract.watch((error, result) => {
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

	handleDeploy(index, address, event) {
		event.preventDefault()
		var value = document.getElementById(index + "_deploy").value
		console.log(value)

		var reContract
		var onyx
		var stake

		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Onyx.deployed().then((instance) => {
				onyx = instance
				onyx.stake.call().then((_stake) => {
					stake = _stake
					console.log(accounts[0])
					onyx.approve(address, stake.toNumber(), {from: accounts[0]}).then(() => {
						this.state.REContract.at(address).then((instance) => {
							reContract = instance
							reContract.transferStake.sendTransaction({from: accounts[0], value: this.state.web3.toWei(value, 'ether')}).then(() => {
								console.log("Deployed " + address)
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
	 			let event = instance.NewContract({_req: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				var i = 0
	  				var table = logs.map(log => {
	  					i++
	  					var index = i;
	  					return [
	  						index, 
	  						log.args._contract, 
	  						log.args._req, 
	  						log.args._deadline.toNumber(),
	  						<form onSubmit={(e) => this.handleDeploy(index, log.args._contract, e)} >
							    <input className="requester-deploy-form-entry" placeholder="ETH" id={index + "_deploy"} />
		  						<button className="button pure-button">Deploy</button>
		  					</form>
	  					]
	  				})
	  				let deployEvent = instance.Deployed({_req: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
		  			deployEvent.get((error, logs) => {
		  				var j = 0
		  				var deployTable = logs.map(log => {
		  					j++
		  					return [
		  						j, 
		  						log.args._contract, 
		  						log.args._req, 
		  						log.args.value.toNumber(), 
		  						<button className="button pure-button" onClick={() => this.handleDeploy(log.args._contract)}>Deploy</button>
		  					]
		  				})
		  				deployTable = deployTable.reduce((result, filter) => {
						    result[filter[1]] = filter;
						    return result;
						},{})
						table = table.filter(function(entry) {
							return !(entry[1] in deployTable)
						})
						console.log(deployTable)
		  				this.setState({ tableData: table })
	  				})
	  			})
	  		})
  		})
  	}

	render() {
		var headers = ["#", "Contract", "Requester", "Deadline", "Deploy"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
	        <div className="pending">
	        	<h1>Pending</h1>
				<Table classes="engineer-table" table={table} />
	        </div>
		)
	}
}

export default Pending