import React, { Component } from 'react'
import moment from 'moment'
import ReactModal from 'react-modal'
import Header from '../components/Header'
import DetailedTable from '../components/DetailedTable'

class Transfer extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  	address: "",
		  	amount: "",
		  	numSell: "",
		  	priceSell: "",
		  	showModal: false,
			tableData: []
		}

		this.getEvents = this.getEvents.bind(this);
		this.handleAmountChange = this.handleAmountChange.bind(this);
		this.handleAddressChange = this.handleAddressChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNumChange = this.handleNumChange.bind(this);
		this.handlePriceChange = this.handlePriceChange.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.handleOpenModal = this.handleOpenModal.bind(this);
		this.handleCloseModal = this.handleCloseModal.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault()

		// Declaring this for later so we can chain functions on OnyxToken.
		var onyx

		// Get accounts.
		this.props.web3.eth.getAccounts((error, accounts) => {
		  this.props.Onyx.deployed().then((instance) => {
		    onyx = instance
		    // Get the value from the contract to prove it worked.
		    return onyx.transfer(this.state.address, this.state.amount, {from: accounts[0]})
		  }).then(() => {
		  	this.setState({address: ""})
		  	this.setState({amount: ""})
		  })
		})
	}

	handleOpenModal () {
		this.setState({ showModal: true })
	}

	handleCloseModal () {
		this.setState({showModal: false})
		this.setState({numSell: ""})
		this.setState({priceSell: ""})
	}

	handleHover() {
		this.setState({ modalXHover: !this.state.modalXHover });
	}

	handleAddressChange(event) {
		this.setState({address: event.target.value})
	}

	handleAmountChange(event) {
		this.setState({amount: event.target.value})
	}

	handleNumChange(event) {
		this.setState({numSell: event.target.value})
	}

	handlePriceChange(event) {
		this.setState({priceSell: event.target.value})
	}

  	getEvents(filterTerm) {
  		this.state.web3.eth.getAccounts((error, accounts) => {
	  		this.state.Factory.deployed().then((instance) => {
	 			let event = instance.Deployed({}, {fromBlock: 0, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				logs.reverse()
	  				var table = logs.map((log, index) => {
	  					return [
	  						log.args._contract,
	  						this.state.web3.toAscii(log.args._name.replace(/0+$/g, "")),
	  						log.args._req, 
	  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"), 
	  						moment(log.args._deadline.toNumber()).format("MM/DD/YYYY hh:mm:ss A"),
	  						<button className="button pure-button" onClick={(e) => this.handleClaim(log.args._contract, e)}>Claim</button>
	  					]
	  				})
	  				let claimEvent = instance.Claimed({_eng: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
		  			claimEvent.get((error, logs) => {
		  				var claimTable = logs.map(log => {
		  					return [
		  						log.args._contract,
		  						log.args._name, 
		  						log.args._req,
		  						this.state.web3.fromWei(log.args.value.toNumber(), "ether"), 
		  						log.args._deadline.toNumber()
		  					]
		  				})
		  				claimTable = claimTable.reduce((result, filter) => {
						    result[filter[0]] = filter;
						    return result;
						},{})
						table = table.filter(function(entry) {
							return !(entry[0] in claimTable || entry[2] === accounts[0])
						})
						if(filterTerm !== "") {
							table = table.filter(function(entry) {
								if(entry[1].toLowerCase().indexOf(filterTerm.toLowerCase()) === -1) {
									return false
								} else {
									return true
								}
							})
						}
						table = table.map((entry, index) => {
	  						entry[0] = entry[0].slice(0,20) + "..."
	  						if(entry[1].length > 23) {
	  							entry[1] = entry[1].slice(0,20) + "..."
	  						}
	  						var output_map = {"headers":[entry[1],entry[3] + " ETH"], "vals":[
	  							{"contract": entry[0]},
	  							{"deadline": entry[4]},
	  							{"value": entry[3] + " ETH"},
	  							{"claim": entry[5]}
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
		var x_class = ""
		if(this.state.modalXHover) {
			x_class = "fa fa-2x fa-times-circle modal-exit"
		} else {
			x_class = "fa fa-2x fa-times-circle-o modal-exit"
		}
		var headers = ["Price", "#"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
	        <main>
	          	<Header
	          		text="> Transfer"
	          	/>
	          	<div className="container transfer-container">
		    		<div className="button-zone">
			        	<button className="pure-button new-req-button" onClick={this.handleOpenModal}>Place Sell Order</button>
			        </div>
		        	<div className="pure-g">
					    <div className="pure-u-1 pure-u-md-1-1">
					    	<DetailedTable classes="requester-table" table={table} />
					    </div>
					</div>
		      	</div>
        		<DetailedTable classes="requester-table" table={table} />
				<ReactModal 
       				isOpen={this.state.showModal}
       				contentLabel="Minimal Modal"
       				className="transfer-modal"
       				overlayClassName="modal-overlay">
    				<div className="modal-top">
    					<div className="pure-g">
        					<div className="pure-u-4-5 modal-header">
	        					New Sell Order
	        				</div>
	        				<div className="pure-u-1-5">
								<i className={x_class} aria-hidden="true" onClick={this.handleCloseModal} onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}></i>
							</div>
						</div>
          			</div>
          			<form className="pure-form pure-form-stacked requester-form" onSubmit={this.handleSubmit}>
				    	<input className="requester-form-entry" value={this.state.numSell} onChange={this.handleNumChange} id="name" placeholder="# ONYX" />
				    	<input className="requester-form-entry" value={this.state.priceSell} onChange={this.handlePriceChange} id="ether" placeholder="Strike Price" />
				    	<button className="button-xlarge pure-button transfer-button">Place Sell Order</button>
					</form>
					<div className="modal-bottom">
					</div>
    			</ReactModal>
	        </main>
		)
	}
}

export default Transfer