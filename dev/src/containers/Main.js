import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

import Requester from './Requester'
import Engineer from './Engineer'
import Home from './Home'
import Mint from './Mint'

class Main extends Component {
	render() {
		return (
			<div className="content">
		        <Switch>
		          <Route exact path='/' component={Home} />
		          <Route exact path='/Requester' component={Requester} />
		          <Route exact path='/Engineer' component={Engineer} />
		          <Route exact path='/Mint' render={() => <Mint web3={this.props.web3} Onyx={this.props.Onyx} />} />
		        </Switch>
			</div>
		)
	}
}

export default Main