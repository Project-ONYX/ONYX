import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import { Switch, Route } from 'react-router-dom'
import Pending from './Pending'
import Deployed from './Deployed'

class Requester extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: "",
		  	value: "",
		  	web3: "",
		  	Factory: "",
		  	Onyx: "",
		  	REContract: ""
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
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

	handleChange(event) {
		this.setState({value: event.target.value})
	}

	render() {
		return (
	        <main>
	        	<div className="container requester-container">
					<h1>Requester</h1>
					<form className="pure-form pure-form-stacked requester-form" onSubmit={this.handleSubmit}>
					    <input className="requester-form-entry" value={this.state.value} onChange={this.handleChange} id="deadline" placeholder="Deadline" />
					    <button className="button-xlarge pure-button requester-button">Request Task</button>
					</form>
				</div>
				<div className="pure-menu pure-menu-horizontal sub-menu">
				    <ul className="pure-menu-list">
				        <li className="pure-menu-item"><a href="/Requester/Pending" className="pure-menu-link">Pending Tasks</a></li>
				        <li className="pure-menu-item"><a href="/Requester/Deployed" className="pure-menu-link">Deployed Tasks</a></li>
				    </ul>
				</div>
				<Switch>
		          	<Route path='/Requester/Pending' render={() => <Pending />} />
		          	<Route path='/Requester/Deployed' render={() => <Deployed />} />
		        </Switch>
	        </main>
		)
	}
}

export default Requester