import React, { Component } from 'react'
import Table from '../components/Table'
import getWeb3 from '../utils/getWeb3'

class Engineer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: ""
		}
	}

  	componentWillMount() {
	    getWeb3
	    .then(results => {
	      this.setState({
	        web3: results.web3
	      })

	      // Instantiate contract once web3 provided.
	      this.instantiateListener()
	    })
	    .catch((e) => {
	      console.log('Error finding web3.')
	      console.log(e)
	    })
  	}

  	instantiateListener() {
		const filter = this.state.web3.eth.filter({
			fromBlock: 0,
		  	toBlock: 'latest',
		  	topics: [this.state.web3.sha3('Mint(address,uint256)')]
		})

		filter.watch((error, result) => {
		   	console.log(result)
		})
  	}

	render() {
		var headers = ["#", "Make", "Model", "Year"]
		var data = [
			[1, "Honda", "Accord", 2009],
			[2, "Toyota", "Camry", 2001],
			[3, "Tesla", "Model X", 2017]
		]
		var table = {
			headers:headers,
			data:data
		}
		return (
	        <main>
	        	<div className="container engineer-container">
					<h1>Engineer</h1>
				</div>
				<Table table={table} />
	        </main>
		)
	}
}

export default Engineer