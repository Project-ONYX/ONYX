import React, { Component } from 'react'
import moment from 'moment'
import axios from 'axios'
import ReactModal from 'react-modal'
import { BeatLoader } from 'react-spinners'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import DetailedTable from '../components/DetailedTable'
import getWeb3 from '../utils/getWeb3'

class Claims extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			Onyx: "",
			Factory: "",
			REContract: "",
			tableData: [],
			validationFile: "",
			validationUploadButtonName: "Select File",
		  	showModal: false,
		  	modalXHover: false,
		  	currentContract: "",
		  	loading: false
		}

		this.getEvents = this.getEvents.bind(this)
		this.handleDownload = this.handleDownload.bind(this)
		this.handleUpload = this.handleUpload.bind(this)
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
				var val = factory.Validated({_eng: accounts[0]}, {fromBlock: "latest"})
				val.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
				var fail = factory.Failed({_eng: accounts[0]}, {fromBlock: "latest"})
				fail.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
		    })
		})
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
			})
		})
	}

	handleUpload(files) {
		var name = files[0].name
		if(name.length > 15) {
			name = name.slice(0, 15) + "..."
		}

		if(name === "") {
			this.setState( { validationFile: "" } )
			this.setState( { validationUploadButtonName: "Select File" }, () => {
				this.getEvents()
			} )
		} else {
			this.setState( { validationFile: files[0] } )
			this.setState( { validationUploadButtonName: name }, () => {
				this.getEvents()
			}  )
		}
	}

	handleValidate(e) {
		e.preventDefault()

		if(this.state.loading) {
			return
		}

		if(this.state.validationFile === "") {
			console.log("No File")
			return
		}

		var formData = new FormData()
		formData.append('file', this.state.validationFile, this.state.validationFile.name)

		var address = this.state.currentContract
		axios.post('/api/files', formData).then((resp) => {
			let id = resp.data.Id;
			this.setState({loading: true})
			var reContract
			this.state.web3.eth.getAccounts((error, accounts) => {
				this.state.REContract.at(address).then((instance) => {
					reContract = instance
					reContract.submit(id, {from: accounts[0]}).then(() => {
						this.setState({loading: false})
						this.handleCloseModal()
						this.getEvents()
					}).catch(() => {
						console.log("Request failed.")
						this.setState({loading: false})
					})
				})
			})
		})
	}

  	getEvents() {
  		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Factory.deployed().then((instance) => {
	 			let event = instance.Claimed({_eng: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				logs.reverse()
	  				var table = logs.map((log, index) => {
	  					return [
	  						log.args._contract, 
	  						log.args._name,
	  						moment(log.args._deadline.toNumber()).format("MM/DD/YYYY hh:mm:ss A"),
	  						log.args._req, 
	  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"),
	  						<button className="button pure-button" onClick={ (e) => this.handleDownload(log.args._contract, e) }>Download</button>,
  							<button className="pure-button button" onClick={(e) => this.handleOpenModal(log.args._contract)}>Validate</button>
	  					]
	  				})

				    let valEvent = instance.Validated({_eng: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
				    valEvent.get((error, logs) => {
	  					var valTable = logs.map(log => {
	  						return [
	  							log.args._contract,
	  							log.args._name,
	  						]
	  					})
	  					valTable = valTable.reduce((result, filter) => {
	  						result[filter[0]] = filter;
	  						return result;
	  					},{})
	  					table = table.filter(entry => {
	  						if(entry[0] in valTable) {
	  							return false
	  						}
	  						return true
	  					})
	  					table = table.map(log => {
	  						log[0] = log[0].slice(0,20) + "..."
	  						log[3] = log[3].slice(0,20) + "..."
	  						log[1] = this.state.web3.toAscii(log[1].replace(/0+$/g, ""))
	  						if(log[1].length > 23) {
	  							log[1] = log[1].slice(0,20) + "..."
	  						}
	  						var output_map = {"headers":[log[1], log[4] + " ETH"], "vals":[
	  							{"contract": log[0]},
	  							{"requester": log[3]},
	  							{"deadline": log[2]},
	  							{"value": log[4] + " ETH"},
	  							{"Download": log[5]},
	  							{"Validate": log[6]}
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
		var headers = ["Claimed"]
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
						<input className="valUploadInput fileUpload" onChange={ (e) => {this.handleUpload(e.target.files)} } name='file' type="file" id="file" placeholder="Upload File" /> 
						<label htmlFor="file" >{this.state.validationUploadButtonName}</label> 
	 				   	<button className="button-xlarge pure-button validator-button">{buttonText}</button>
					</form>
					<div className="modal-bottom">
					</div>
				</ReactModal>
			</div>
		)
	}
}

export default Claims