import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import getWeb3 from '../utils/getWeb3'

import Logo from "../../public/logo.svg"

class Home extends Component {
	render() {
		return (
	        <main className="container home-container">
	          <div className="pure-g">
	            <div className="pure-u-1-1">
		            <img src={Logo} className="logo" alt="logo" />
		            <h1>Project Onyx</h1>
		            <h2>(Alpha Build)</h2>
	            </div>
	          </div>
	        </main>
		)
	}
}

export default Home