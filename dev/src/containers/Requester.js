import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import Table from '../components/Table'

class Requester extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: "",
		  	value: "",
		  	web3: "",
		  	Factory: "",
		  	Onyx: "",
		  	REContract: "",
		  	tableData: []
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleDeploy = this.handleDeploy.bind(this);
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
	    const Factory = contract(ReqEngContractFactory)
  	    const Onyx = contract(OnyxTokenContract)
	    const REContract = contract(ReqEngContract)
	    Onyx.setProvider(this.state.web3.currentProvider)
	    Factory.setProvider(this.state.web3.currentProvider)
	    REContract.setProvider(this.state.web3.currentProvider)
	    this.setState({ Factory: Factory })
	    this.setState({ REContract: REContract })
	    this.setState({ Onyx: Onyx })
	    this.state.web3.eth.getAccounts((error, accounts) => {
			this.setState({
				account: accounts[0]
			})
		})
	    this.getEvents()
  	}

	handleSubmit(event) {
		event.preventDefault()

		// Declaring this for later so we can chain functions on OnyxToken.
		var factory

		// Get accounts.
		this.state.web3.eth.getAccounts((error, accounts) => {
		  this.state.Factory.deployed().then((instance) => {
		    factory = instance
		    // Get the value from the contract to prove it worked.
		    return factory.newContract(this.state.value, {from: accounts[0]})
		  }).then(() => {
		  	this.setState({value: ""})
		  })
		})
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
				onyx.getStake.call().then((_stake) => {
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
  		this.state.Factory.deployed().then((instance) => {
 			let event = instance.NewContract({_req: this.state.account}, {fromBlock: 0, toBlock: 'latest'})
  			event.get((error, logs) => {
  				var i = 0
  				var table = logs.map(log => {
  					i++
  					var index = i;
  					return [
  						index, 
  						log.args._contract, 
  						log.args._deadline.toNumber(),
  						<form onSubmit={(e) => this.handleDeploy(index, log.args._contract, e)} >
						    <input className="requester-deploy-form-entry" placeholder="ETH" id={index + "_deploy"} />
	  						<button className="button pure-button requester-deploy-button">Deploy</button>
 						</form>
  					]
  				})
  				this.setState({ tableData: table })
  			})
  		})
  	}

	handleChange(event) {
		this.setState({value: event.target.value})
	}

	render() {
		var headers = ["#", "Contract", "Deadline", "Deploy"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
	        <main>
	        	<div className="container requester-container">
					<h1>Requester</h1>
					<form className="pure-form pure-form-stacked requester-form" onSubmit={this.handleSubmit}>
					    <input className="requester-form-entry" value={this.state.value} onChange={this.handleChange} id="deadline" placeholder="Deadline" />
					    <button className="button-xlarge pure-button requester-button">Request Task</button>
					</form>
				</div>
				<Table classes="requester-table" table={table} />
	        </main>
		)
	}
}

export default Requester