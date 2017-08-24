import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import getWeb3 from '../utils/getWeb3'

class Requester extends Component {
	render() {
		return (
	        <main className="container">
	          <div className="pure-g">
	            <div className="pure-u-1-1">
	              <h1>Requester!</h1>
	              <p>Your Truffle Box is installed and ready.</p>
	            </div>
	          </div>
	        </main>
		)
	}
}

export default Requester