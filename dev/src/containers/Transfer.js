import React, { Component } from 'react'

class Transfer extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  	address: "",
		  	amount: ""		
		}

		this.handleAmountChange = this.handleAmountChange.bind(this);
		this.handleAddressChange = this.handleAddressChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault()

		// Declaring this for later so we can chain functions on OnyxToken.
		var onyx

		// Get accounts.
		this.props.web3.eth.getAccounts((error, accounts) => {
		  this.props.Onyx.deployed().then((instance) => {
		    onyx = instance
		    // Get the value from the contract to prove it worked.
		    return onyx.transfer(this.state.address, this.state.amount, {from: accounts[0]})
		  }).then(() => {
		  	this.setState({address: ""})
		  	this.setState({amount: ""})
		  })
		})
	}

	handleAddressChange(event) {
		this.setState({address: event.target.value})
	}

	handleAmountChange(event) {
		this.setState({amount: event.target.value})
	}

	render() {
		return (
	        <main className="container transfer-container">
	          <div className="pure-g">
	            <div className="pure-u-1-1">
	              <h1>Transfer</h1>
	              	<form className="pure-form pure-form-stacked transfer-form" onSubmit={this.handleSubmit}>
				        <input className="transfer-form-entry" value={this.state.address} onChange={this.handleAddressChange} id="address" placeholder="Address" />
				        <input className="transfer-form-entry" value={this.state.amount} onChange={this.handleAmountChange} id="amount" placeholder="Amount" />
				        <button className="button-xlarge pure-button transfer-button">Transfer ONYX</button>
					</form>
	            </div>
	          </div>
	        </main>
		)
	}
}

export default Transfer