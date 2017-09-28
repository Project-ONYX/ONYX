import getWeb3 from '../utils/getWeb3'
import React, { Component } from 'react'
import axios from 'axios'
import ReactModal from 'react-modal'
import { BeatLoader } from 'react-spinners'
import DetailedTable from '../components/DetailedTable'

import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ValidatorNetworkContract from '../../build/contracts/ValidatorNetwork.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContractContract from '../../build/contracts/ReqEngContract.json'

class Validator extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			ValidatorNetwork: "",
			Factory: "",
			ReqEngContract: "",
			tableData: [],
			validationFile: "",
			validationUploadButtonName: "Select File",
			PassPhrase: "",
		  	showModal: false,
		  	modalXHover: false,
		  	currentContract: "",
		  	loading: false
		}

		this.getEvents = this.getEvents.bind(this)
		this.handlePassPhraseChange = this.handlePassPhraseChange.bind(this)
		this.handleValidate = this.handleValidate.bind(this)
		this.handleOpenModal = this.handleOpenModal.bind(this)
		this.handleCloseModal = this.handleCloseModal.bind(this)
		this.handleHover = this.handleHover.bind(this)
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
	    const ValidatorNetwork = contract(ValidatorNetworkContract)
	    const Factory = contract(ReqEngContractFactory)
	    const ReqEngContract = contract(ReqEngContractContract)
	    Onyx.setProvider(this.state.web3.currentProvider)
	    ValidatorNetwork.setProvider(this.state.web3.currentProvider)
	    Factory.setProvider(this.state.web3.currentProvider)
	    ReqEngContract.setProvider(this.state.web3.currentProvider)
	    this.setState({ Onyx: Onyx })
	    this.setState({ ValidatorNetwork: ValidatorNetwork })
	    this.setState({ Factory: Factory })
	    this.setState({ ReqEngContract: ReqEngContract })

	    var valNet
	    var factory
	    this.state.web3.eth.getAccounts((error, accounts) => {
		    this.state.ValidatorNetwork.deployed().then((instance) => {
		    	valNet = instance
				var job = valNet.Validate({_val: accounts[0]}, {fromBlock: "0"})
				job.watch((error, result) => {
					if (error == null) {
						console.log(result)
				  		this.getEvents()
					} else {
						console.log(error)
					}
				})
				var finish = valNet.Validated({}, {fromBlock: "0"})
				finish.watch((error, result) => {
					if (error == null) {
						console.log("Validated!!!")
				  		this.getEvents()
					} else {
						console.log(error)
					}
				})
		    })
			this.state.Factory.deployed().then((instance) => {
				factory = instance
				var fail = factory.Failed({},{fromBlock: 960000})
				fail.watch((error, result) => {
					if (error == null) {
						console.log(result)
					} else {
						console.log(error)
					}
				})
			})

		})
	    this.getEvents()
  	}

	handlePassPhraseChange(e) {
		this.setState({PassPhrase: e.target.value})
	}

	handleValidate(e, address) {
		e.preventDefault()

		if(this.state.loading) {
			return
		}

		var reContract
		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.ReqEngContract.at(this.state.currentContract).then((instance) => {
				reContract = instance
				console.log(this.state.PassPhrase)
				reContract.feedback(0, accounts[0], {from: accounts[0]}).then(() => {
					console.log("Successful")
					this.setState({loading: false})
					this.handleCloseModal()
					this.getEvents()
				}).catch(() => {
					console.log("Validate failed.")
					this.setState({loading: false})
				})
			})
		})
	}

  	getEvents() {
  		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.ValidatorNetwork.deployed().then((instance) => {
	 			let event = instance.Validate({_val: accounts[0]}, {fromBlock: 960000, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				logs.reverse()
	  				var table = logs.map((log, index) => {
	  					return [
	  						log.args._val, 
	  						log.args._dataHash,
	  						log.args._job, 
  							<button className="pure-button button" onClick={(e) => this.handleOpenModal(log.args._job)}>Validate</button>
	  					]
	  				})

				    let valEvent = instance.Validated({_val: accounts[0]}, {fromBlock: 960000, toBlock: 'latest'})
				    valEvent.get((error, logs) => {
	  					var valTable = logs.map(log => {
	  						return [
	  							log.args._val,
	  							log.args._job
	  						]
	  					})
	  					valTable = valTable.reduce((result, filter) => {
	  						result[filter[1]] = filter;
	  						return result;
	  					},{})
	  					table = table.filter(entry => {
	  						if(entry[1] in valTable) {
	  							return false
	  						}
	  						return true
	  					})
	  					table = table.map(log => {
	  						var output_map = {"headers":[log[2], log[1]], "vals":[
	  							{"validator": log[0]},
	  							{"dataHash": log[1]},
	  							{"jobContract": log[2]},
	  							{"Validate": log[3]}
	  						]}
	  						return output_map
	  					})
						this.setState({ tableData: table })
				    })
	  			})
	  		})
  		})
  	}

	handleOpenModal (contract) {
		this.setState({ currentContract: contract});
		this.setState({ showModal: true });
	}

	handleCloseModal () {
		if(this.state.loading === false) {
			this.setState({ validationFile: "" })
			this.setState({ validationUploadButtonName: "Select File" })
			this.setState({ showModal: false })
			this.setState({ currentContract: "" })
		}
	}

	handleHover() {
		this.setState({ modalXHover: !this.state.modalXHover });
	}

	render() {
		var headers = ["Job", "DataHash"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		var x_class = ""
		var buttonText = ""
		if(this.state.modalXHover) {
			x_class = "fa fa-2x fa-times-circle modal-exit"
		} else {
			x_class = "fa fa-2x fa-times-circle-o modal-exit"
		}
		if(this.state.loading) {
			buttonText = <BeatLoader color={'white'} loading={this.state.loading} />
		} else {
			buttonText = "Validate"
		}
		return(
			<div>
				<DetailedTable classes="requester-table" table={table} />
				<ReactModal 
						isOpen={this.state.showModal}
						contentLabel="Minimal Modal Example"
						className="validate-modal"
						overlayClassName="modal-overlay">
					<div className="modal-top">
						<div className="pure-g">
							<div className="pure-u-4-5 modal-header">
								Validate
							</div>
							<div className="pure-u-1-5">
								<i className={x_class} aria-hidden="true" onClick={this.handleCloseModal} onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}></i>
							</div>
						</div>
					</div>
					<form className="pure-form pure-form-stacked requester-form" onSubmit={this.handleValidate }>
						<input className="requester-form-entry" value={this.state.PassPhrase} onChange={this.handlePassPhraseChange} disabled={this.state.loading} id="name" placeholder="PassPhrase" />
	 				   	<button className="button-xlarge pure-button validator-button">{buttonText}</button>
					</form>
					<div className="modal-bottom">
					</div>
				</ReactModal>
			</div>
		)
	}
}

export default Validator