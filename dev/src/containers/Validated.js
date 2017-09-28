import React, { Component } from 'react'
import moment from 'moment'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import DetailedTable from '../components/DetailedTable'
import getWeb3 from '../utils/getWeb3'

class Validated extends Component {
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
				var val = factory.Validated({_eng: accounts[0]}, {fromBlock: "latest"})
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
	 			let event = instance.Validated({_req: accounts[0]}, {fromBlock: 960000, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				logs.reverse()
	  				var table = logs.map(log => {
	  					return [
	  						log.args._contract, 
	  						log.args._name, 
	  						log.args._eng,
	  						moment(log.args._deadline.toNumber()).format("MM/DD/YYYY hh:mm:ss A"),
	  						log.args._val,
	  						this.state.web3.fromWei(log.args.value.toNumber(), "ether")
	  					]
	  				})
	  				table = table.map(log => {
	  					log[1] = this.state.web3.toAscii(log[1].replace(/0+$/g, ""))
	  					if(log[1].length > 23) {
	  						log[1] = log[1].slice(0,20) + "..."
	  					}
	  					var output_map = {"headers":[log[1], log[5] + " ETH"], "vals":[
	  						{"contract": log[0].slice(0,20) + "..."},
	  						{"engineer": log[2].slice(0,20) + "..."},
	  						{"validator": log[4].slice(0,20) + "..."},
	  						{"deadline": log[3]},
	  						{"value": log[5] + " ETH"}
	  					]}
	  					return output_map
	  				})
	  				this.setState({ tableData: table })
	  			})
	  		})
  		})
  	}

	render() {
		var headers = ["Validated"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
			<DetailedTable classes="requester-table" table={table} />
		)
	}
}

export default Validated