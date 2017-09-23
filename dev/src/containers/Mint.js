import React, { Component } from 'react'
import Header from '../components/Header'

class Mint extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  	value: ""		
		}

		this.handleChange = this.handleChange.bind(this);
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
		    return onyx.mint(accounts[0], this.props.web3.toWei(this.state.value, 'ether'), {from: accounts[0]})
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
	          <Header 
	        	text="> Mint"
	          />
	          <div  className="container mint-container">
		          <div className="pure-g">
		            <div className="pure-u-1-1">
		              <h1>Mint</h1>
		              	<form className="pure-form pure-form-stacked mint-form" onSubmit={this.handleSubmit}>
					        <input className="mint-form-entry" value={this.state.value} onChange={this.handleChange} id="amount" placeholder="Amount" />
					        <button className="button-xlarge pure-button mint-button">Mint ONYX</button>
						</form>
		            </div>
		          </div>
		       </div>
	        </main>
		)
	}
}

export default Mint