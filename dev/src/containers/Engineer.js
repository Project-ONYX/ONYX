import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import Table from '../components/Table'
import getWeb3 from '../utils/getWeb3'

class Engineer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			Factory: "",
			tableData: []
		}

		this.getEvents = this.getEvents.bind(this)
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
	    Onyx.setProvider(this.state.web3.currentProvider)
	    Factory.setProvider(this.state.web3.currentProvider)
	    this.setState({ Onyx: Onyx })
	    this.setState({ Factory: Factory })
	    this.getEvents()
  	}

  	getEvents() {
  		this.state.Factory.deployed().then((instance) => {
 			let event = instance.Deployed({}, {fromBlock: 0, toBlock: 'latest'})
  			event.get((error, logs) => {
  				var i = 0
  				var table = logs.map(log => {
  					i++
  					return [i, log.args._contract, log.args._req, log.args.value.toNumber()]
  				})
  				this.setState({ tableData: table })
  			})
  		})
  	}

	render() {
		var headers = ["#", "Contract", "Requester", "Value"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
	        <main>
	        	<div className="container engineer-container">
					<h1>Engineer</h1>
				</div>
				<Table classes="engineer-table" table={table} />
	        </main>
		)
	}
}

export default Engineer