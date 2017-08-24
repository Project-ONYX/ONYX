import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import getWeb3 from '../utils/getWeb3'
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
		          <Route exact path='/Mint' component={Mint} />
		        </Switch>
			</div>
		)
	}
}

export default Main