import React, { Component } from 'react'

import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import Table from '../components/Table'
import getWeb3 from '../utils/getWeb3'

class Claims extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			Factory: "",
			REContract: "",
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
	    const REContract = contract(ReqEngContract)
	    Onyx.setProvider(this.state.web3.currentProvider)
	    Factory.setProvider(this.state.web3.currentProvider)
	    REContract.setProvider(this.state.web3.currentProvider)
	    this.setState({ Onyx: Onyx })
	    this.setState({ Factory: Factory })
	    this.setState({ REContract: REContract })
	    this.getEvents()
  	}

	handleDownload(address, event) {
		event.preventDefault()

		var reContract

		this.state.REContract.at(address).then((instance) => {
			reContract = instance
			reContract.dataHash.call().then((id) => {
				console.log("ID: " + id);
				setTimeout(() => {
					const response = {
						file: 'http://localhost:3001/api/files/' + id
					}
					window.location.href = response.file;
				}, 100);
				// axios.get('/api/files/' + id).then(function (response) {
				//     console.log("Download Successful!");
				//     console.log(response);
				// 	FileDownload(response.data, id + ".zip", "application/zip");
				// })
				// .catch(function (error) {
				//    	console.log(error);
				// });
			})
		})
	}

  	getEvents() {
  		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Factory.deployed().then((instance) => {
	 			let event = instance.Claimed({_eng: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				var i = 0
	  				var table = logs.map(log => {
	  					i++
	  					return [
	  						i, 
	  						log.args._contract, 
	  						log.args._req, 
	  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"),
	  						<button className="button pure-button" onClick={(e) => this.handleDownload(log.args._contract, e)}>Download</button>
	  					]
	  				})
	  				this.setState({ tableData: table })
	  			})
	  		})
  		})
  	}

	render() {
		var headers = ["#", "Contract", "Requester", "Value (ETH)", "Link"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
	        <div className="claims">
   	        	<h1>Claims</h1>
				<Table classes="engineer-table" table={table} />
	        </div>
		)
	}
}

export default Claims