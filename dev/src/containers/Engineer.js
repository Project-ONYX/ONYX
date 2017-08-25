import React, { Component } from 'react'
import Table from '../components/Table'

class Engineer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			value: ""
		}
	}

  	componentWillMount() {
  	}

	getTasks() {
		const filter = this.props.web3.eth.filter({
			fromBlock: 0,
		  	toBlock: 'latest',
		  	// topics: [this.props.web3.sha3('Deployed(address,uint256)')]
		  	topics: [this.props.web3.sha3('Mint(address,uint256)')]
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
			data,data
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