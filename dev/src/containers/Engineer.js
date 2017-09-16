import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import getWeb3 from '../utils/getWeb3'
import Header from '../components/Header'
import Claims from './Claims'
import Completed from './Completed'

class Engineer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			Factory: "",
			REContract: "",
			tableData: []
		}
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
  	}

	render() {
		return(
			<main>
	        	<Header 
	        		text="> My Profile"
	        	/>
	        	<div className="container engineer-container">
		        	<div className="button-zone">
				    	<a href="/Marketplace"><button className="pure-button new-req-button">Marketplace</button></a>
				    </div>
		        	<div className="pure-g">
					    <div className="pure-u-1 pure-u-md-1-2 right-arrow">
					        <Claims/>
					    </div>
					    <div className="pure-u-1 pure-u-md-1-2">
					        <Completed/>
					    </div>
					</div>
				</div>
	        </main>
		)
	}
}

export default Engineer