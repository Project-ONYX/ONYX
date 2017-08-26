import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import getWeb3 from '../utils/getWeb3'
import { Switch, Route } from 'react-router-dom'
import Marketplace from './Marketplace'
import Claims from './Claims'

class Engineer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			Factory: "",
			REContract: ""
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
		return (
	        <main>
	        	<div className="container engineer-container">
					<h1>Engineer</h1>
				</div>
				<div className="pure-menu pure-menu-horizontal sub-menu">
				    <ul className="pure-menu-list">
				        <li className="pure-menu-item"><a href="/Engineer/Marketplace" className="pure-menu-link">Marketplace</a></li>
				        <li className="pure-menu-item"><a href="/Engineer/Claims" className="pure-menu-link">Current Claims</a></li>
				    </ul>
				</div>
				<Switch>
		          	<Route path='/Engineer/Marketplace' render={() => <Marketplace />} />
		          	<Route path='/Engineer/Claims' render={() => <Claims />} />
		        </Switch>
	        </main>
		)
	}
}

export default Engineer