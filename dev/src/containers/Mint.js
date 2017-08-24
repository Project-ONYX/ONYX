import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import getWeb3 from '../utils/getWeb3'

class Mint extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  	value: "",
		  	web3: null
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentWillMount() {
	// Get network provider and web3 instance.
	// See utils/getWeb3 for more info.

		getWeb3
		.then(results => {
		  this.setState({
		    web3: results.web3
		  })

		  // Instantiate contract once web3 provided.
		  this.instantiateContract()
		})
		.catch(() => {
		  console.log('Error finding web3.')
		})
	}

	instantiateContract() {
		/*
		 * SMART CONTRACT EXAMPLE
		 *
		 * Normally these functions would be called in the context of a
		 * state management library, but for convenience I've placed them here.
		 */

		const contract = require('truffle-contract')
		this.Onyx = contract(OnyxTokenContract)
		this.Onyx.setProvider(this.state.web3.currentProvider)
	}

	handleSubmit(event) {
		// Declaring this for later so we can chain functions on OnyxToken.
		var onyx

		// Get accounts.
		this.state.web3.eth.getAccounts((error, accounts) => {
		  this.Onyx.deployed().then((instance) => {
		    onyx = instance
		    // Get the value from the contract to prove it worked.
		    return onyx.mint(accounts[0], this.state.value, {from: accounts[0]})
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
	        <main className="container mint-container">
	          <div className="pure-g">
	            <div className="pure-u-1-1">
	              <h1>Mint</h1>
	              	<form className="pure-form pure-form-stacked mint-form" onSubmit={this.handleSubmit}>
				    	<fieldset>
					        <input className="mint-form-entry" value={this.state.value} onChange={this.handleChange} id="amount" placeholder="Amount" />
					        <button className="button-xlarge pure-button mint-button">Mint Tokens</button>
					    </fieldset>
					</form>
	            </div>
	          </div>
	        </main>
		)
	}
}

export default Mint