import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

import Requester from './Requester'
import Engineer from './Engineer'
import Home from './Home'
import Mint from './Mint'
import Transfer from './Transfer'

class Main extends Component {
	render() {
		return (
			<div className="content">
		        <Switch>
		          <Route exact path='/' component={Home} />
		          <Route path='/Requester' render={() => <Requester />} />
		          <Route path='/Engineer' render={() =>  <Engineer />} />
		          <Route exact path='/Mint' render={() =>      <Mint     web3={this.props.web3} Onyx={this.props.Onyx} />} />
		          <Route exact path='/Transfer' render={() =>  <Transfer web3={this.props.web3} Onyx={this.props.Onyx} />} />
		        </Switch>
			</div>
		)
	}
}

export default Main