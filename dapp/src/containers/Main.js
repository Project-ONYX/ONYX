import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import Requester from './Requester'
import Engineer from './Engineer'
import Home from './Home'
import Transfer from './Transfer'
import Marketplace from './Marketplace'
import Disclaimer from './Disclaimer'
// import Mint from './Mint'
// import Validator from './Validator'

class Main extends Component {
	render() {
		return (
			<div className="content">
				<Route exact path='/' component={Home} />
				<Route path='/Requester' render={() => <Requester />} />
				<Route path='/Engineer' render={() =>  <Engineer />} />
				<Route path='/Marketplace' render={() => <Marketplace />} />
				<Route path='/Disclaimer' render={() => <Disclaimer />} />
				<Route exact path='/Transfer' render={() =>  <Transfer web3={this.props.web3} Onyx={this.props.Onyx} />} />
			</div>
		)
	}
}
				// <Route exact path='/Mint' render={() =>      <Mint     web3={this.props.web3} Onyx={this.props.Onyx} />} />
				// <Route path='/Validator' render={() => <Validator />} />
export default Main