import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3'
import ReactModal from 'react-modal'
import axios from 'axios'
import moment from 'moment'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import Header from '../components/Header'
import Deployed from './Deployed'
import InProgress from './InProgress'
import Validated from './Validated'

class Requester extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: "",
		  	deadlineValue: "",
		  	EthValue: "",
		  	nameValue: "",
		  	web3: "",
		  	Factory: "",
		  	Onyx: "",
		  	REContract: "",
		  	showModal: false,
		  	modalXHover: false,
		  	inputButtonLabel: "Select File",
		  	filePicked: false
		}

		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleDeadlineChange = this.handleDeadlineChange.bind(this);
		this.handleEthChange = this.handleEthChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleOpenModal = this.handleOpenModal.bind(this);
		this.handleCloseModal = this.handleCloseModal.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.handleFileChange = this.handleFileChange.bind(this);
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
	    const Factory = contract(ReqEngContractFactory)
  	    const Onyx = contract(OnyxTokenContract)
	    const REContract = contract(ReqEngContract)
	    Onyx.setProvider(this.state.web3.currentProvider)
	    Factory.setProvider(this.state.web3.currentProvider)
	    REContract.setProvider(this.state.web3.currentProvider)
	    this.setState({ Factory: Factory })
	    this.setState({ REContract: REContract })
	    this.setState({ Onyx: Onyx })
	    this.state.web3.eth.getAccounts((error, accounts) => {
			this.setState({
				account: accounts[0]
			})
		})
  	}

	handleOpenModal () {
		this.setState({ showModal: true });
	}

	handleCloseModal () {
		this.setState({nameValue: ""})
		this.setState({deadlineValue: ""})
		this.setState({EthValue: ""})
		this.setState({filePicked: false})
		this.setState({inputButtonLabel: "Select File"})
		this.setState({ showModal: false });
	}

	handleHover() {
		this.setState({ modalXHover: !this.state.modalXHover });
	}

	handleFileChange(files) {
		var name = files[0].name
		if(name.length > 15) {
			name = name.slice(0, 15) + "..."
		}
		if(name === "") {
			this.setState( {inputButtonLabel: "Select File", filePicked: false })
		} else {
			this.setState( {inputButtonLabel: name, filePicked: true })
		}
	}

	handleSubmit(event) {
		event.preventDefault()

		var fileSelect = document.getElementById('file')
		if(fileSelect.files.length === 0 || this.state.nameValue === "" || this.state.deadlineValue === "" || this.state.EthValue === "") {
			return;
		}
		let file = fileSelect.files[0]

		var formData = new FormData()
		formData.append('file', file, file.name)

		axios.post('/api/files', formData).then((resp) => {
			let id = resp.data.Id;

			// Declaring this for later so we can chain functions on OnyxToken.
			var factory
			var onyx
			var reContract
			var stake
			var address
			var allowance

			// Get accounts.
			this.state.web3.eth.getAccounts((error, accounts) => {
			  this.state.Factory.deployed().then((instance) => {
			    factory = instance
			    // Get the value from the contract to prove it worked.
			    return factory.newContract(this.state.web3.fromAscii(this.state.nameValue, 32), moment(this.state.deadlineValue).valueOf(), id, {from: accounts[0]})
			  }).then((addr) => {
			  	address = addr.logs[0].args._contract
			  	this.state.Onyx.deployed().then((instance) => {
			  		onyx = instance
			  		onyx.stake.call().then((_stake) => {
			  			stake = _stake.toNumber()
			  			onyx.allowance.call(accounts[0], address).then((_allowance) => {
			  				allowance = _allowance.toNumber()
			  				if(allowance >= stake) {
			  					this.request(address, accounts[0])
			  				}
			  				else if(allowance > 0 && allowance < stake) {
			  					onyx.approve(address, 0, {from accounts[0]}).then(() => {
			  						onyx.approve(address, stake, {from: accounts[0]}).then(() => {
			  							this.request(address, accounts[0])
			  						})
			  					})
			  				}
			  				else {
					  			onyx.approve(address, stake, {from: accounts[0]}).then(() => {
					  				this.request(address, accounts[0])
								})
			  				}
			  			})
					})
				})
			  })
			})
		}).catch(function(err) {
			console.log(err);
		})
	}

	request(address, account) {
		var reContract
		this.state.REContract.at(address).then((instance) => {
			reContract = instance
			reContract.transferStake.sendTransaction({from: account, value: this.state.web3.toWei(this.state.EthValue, 'ether')}).then(() => {
				this.handleCloseModal()
			})
		})
	}

	handleDeadlineChange(event) {
		this.setState({deadlineValue: event.target.value})
	}

	handleEthChange(event) {
		this.setState({EthValue: event.target.value})
	}

	handleNameChange(event) {
		this.setState({nameValue: event.target.value})
	}

	render() {
		var x_class = ""
		if(this.state.modalXHover) {
			x_class = "fa fa-2x fa-times-circle modal-exit"
		} else {
			x_class = "fa fa-2x fa-times-circle-o modal-exit"
		}
		return (
	        <main>
	        	<Header 
	        		text="> Requester"
	        	/>
	        	<div className="container requester-container">
	        		<div className="button-zone">
			        	<button className="pure-button new-req-button" onClick={this.handleOpenModal}>New Request</button>
			        </div>
		        	<div className="pure-g">
					    <div className="pure-u-1 pure-u-md-1-3 right-arrow">
					        <Deployed/>
					    </div>
					    <div className="pure-u-1 pure-u-md-1-3 right-arrow">
					        <InProgress/>
					    </div>
					    <div className="pure-u-1 pure-u-md-1-3 right-padding">
					        <Validated/>
					    </div>
					</div>
					<ReactModal 
           				isOpen={this.state.showModal}
           				contentLabel="Minimal Modal Example"
           				className="new-req-modal"
           				overlayClassName="modal-overlay">
        				<div className="modal-top">
        					<div className="pure-g">
	        					<div className="pure-u-4-5 modal-header">
		        					New Request
		        				</div>
		        				<div className="pure-u-1-5">
									<i className={x_class} aria-hidden="true" onClick={this.handleCloseModal} onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}></i>
								</div>
							</div>
	          			</div>
	          			<form className="pure-form pure-form-stacked requester-form" onSubmit={this.handleSubmit}>
					    	<input className="requester-form-entry fileUpload" onChange={(e) => {this.handleFileChange(e.target.files)}} name='file' type="file" id="file" placeholder="Upload File" /><label htmlFor="file">{ this.state.inputButtonLabel }</label>
					    	<input className="requester-form-entry" value={this.state.nameValue} onChange={this.handleNameChange} id="name" placeholder="Name" />
					    	<input className="requester-form-entry" type="datetime-local" onChange={this.handleDeadlineChange} id="deadline" placeholder="Deadline" />
					    	<input className="requester-form-entry" value={this.state.EthValue} onChange={this.handleEthChange} id="ether" placeholder="ETH" />
					    	<button className="button-xlarge pure-button requester-button">Request Task</button>
						</form>
						<div className="modal-bottom">
						</div>
        			</ReactModal>
				</div>
	        </main>
		)
	}
}

export default Requester