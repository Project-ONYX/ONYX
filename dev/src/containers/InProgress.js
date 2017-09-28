import React, { Component } from 'react'
import moment from 'moment'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import DetailedTable from '../components/DetailedTable'
import getWeb3 from '../utils/getWeb3'

class InProgress extends Component {
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
		
	    var factory
		this.state.web3.eth.getAccounts((error, accounts) => {
		    this.state.Factory.deployed().then((instance) => {
		    	factory = instance
				var claim = factory.Claimed({_eng: accounts[0]}, {fromBlock: "latest"})
				claim.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
				var val = factory.Validated({_req: accounts[0]}, {fromBlock: "latest"})
				val.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
		    })
		})
	    this.getEvents()
  	}

  	getEvents() {
  		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Factory.deployed().then((instance) => {
	 			let event = instance.Claimed({_req: accounts[0]}, {fromBlock: 960000, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				logs.reverse()
	  				var table = logs.map(log => {
	  					return [
	  						log.args._contract,
	  						log.args._name, 
	  						moment(log.args._deadline.toNumber()).format("MM/DD/YYYY hh:mm:ss A"),
	  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"), 
	  						log.args._eng
	  					]
	  				})
	  				let validateEvent = instance.Validated({_req: accounts[0]}, {fromBlock: 960000, toBlock: 'latest'})
	  				validateEvent.get((error, logs) => {
	  					var validatedTable = logs.map(log => {
	  						return [
	  							log.args._contract,
	  							log.args._req,
	  							log.args._eng,
	  							log.args._val
	  						]
	  					})
	  					validatedTable = validatedTable.reduce((result, filter) => {
	  						result[filter[0]] = filter;
	  						return result;
	  					},{})
	  					table = table.filter(entry => {
	  						if(entry[0] in validatedTable) {
	  							return false
	  						}
	  						return true
	  					})
	  					table = table.map(log => {
	  						log[1] = this.state.web3.toAscii(log[1].replace(/0+$/g, ""))
	  						if(log[1].length > 23) {
	  							log[1] = log[1].slice(0,20) + "..."
	  						}
	  						var output_map = {"headers":[log[1], log[3] + " ETH"], "vals":[
	  							{"contract": log[0].slice(0,20) + "..."},
	  							{"engineer": log[4].slice(0,20) + "..."},
	  							{"deadline": log[2]},
	  							{"value": log[3] + " ETH"}
	  						]}
	  						return output_map
	  					})
		  				this.setState({ tableData: table })
	  				})
	  			})
	  		})
  		})
  	}

	render() {
		var headers = ["In Progress"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
			<DetailedTable classes="requester-table" table={table} />
		)
	}
}

export default InProgress