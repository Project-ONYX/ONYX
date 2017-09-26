import React, { Component } from 'react'
import moment from 'moment'
import getWeb3 from '../utils/getWeb3'
import ReactModal from 'react-modal'
import { BeatLoader } from 'react-spinners'
import Header from '../components/Header'
import DetailedTable from '../components/DetailedTable'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import TradeNetworkContract from '../../build/contracts/TradeNetwork.json'

class Transfer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: "",
			TradeNetwork: "",
		  	address: "",
		  	amount: "",
		  	numSell: "",
		  	priceSell: "",
		  	showModal: false,
			tableData: [],
			loading: false
		}

		this.getEvents = this.getEvents.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNumChange = this.handleNumChange.bind(this);
		this.handlePriceChange = this.handlePriceChange.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.handleOpenModal = this.handleOpenModal.bind(this);
		this.handleCloseModal = this.handleCloseModal.bind(this);
		this.newTrade = this.newTrade.bind(this);
		this.handleTrade = this.handleTrade.bind(this);
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
	    const TradeNetwork = contract(TradeNetworkContract)
	    Onyx.setProvider(this.state.web3.currentProvider)
	    TradeNetwork.setProvider(this.state.web3.currentProvider)
	    this.setState({ Onyx: Onyx })
	    this.setState({ TradeNetwork: TradeNetwork })
		
	    var tradeNet
		this.state.web3.eth.getAccounts((error, accounts) => {
		    this.state.TradeNetwork.deployed().then((instance) => {
		    	tradeNet = instance
				var newTrades = tradeNet.NewTrade({}, {fromBlock: "latest"})
				newTrades.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
				var closedTrades = tradeNet.CloseTrade({}, {fromBlock: "latest"})
				closedTrades.watch((error, result) => {
					if (error == null) {
				  		this.getEvents()
					}
				})
		    })
		})
	    this.getEvents()
  	}

	handleSubmit(event) {
		event.preventDefault()

		if(isNaN(this.state.numSell) || isNaN(this.state.priceSell)) {
			return
		}

		var numONYX = this.state.web3.toWei(this.state.numSell, 'ether')
		var numEther = this.state.priceSell*numONYX

		var onyx
		var tradeNet
		var allowance

		this.setState({loading: true})

		this.state.web3.eth.getAccounts((error, accounts) => {
			this.state.Onyx.deployed().then((instance) => {
				onyx = instance
				this.state.TradeNetwork.deployed().then((instance) => {
					tradeNet = instance
					onyx.allowance.call(accounts[0], tradeNet.address).then((_allowance) => {
		  				allowance = _allowance.toNumber()
		  				if(allowance >= numONYX) {
		  					this.newTrade(numONYX, numEther, accounts[0])
		  				}
		  				else if(allowance > 0 && allowance < numONYX) {
		  					onyx.approve(tradeNet.address, 0, {from: accounts[0]}).then(() => {
		  						onyx.approve(tradeNet.address, numONYX, {from: accounts[0]}).then(() => {
		  							this.newTrade(numONYX, numEther, accounts[0])
		  						})
		  					})
		  				}
		  				else {
				  			onyx.approve(tradeNet.address, numONYX, {from: accounts[0]}).then(() => {
				  				this.newTrade(numONYX, numEther, accounts[0])
							})
		  				}
		  			})
				})
			})
		})
	}

	newTrade(numONYX, numEther, account) {
		var tradeNet
		this.state.TradeNetwork.deployed().then((instance) => {
			tradeNet = instance
			tradeNet.newTrade(numONYX, numEther, {from: account}).then(() => {
				this.setState({loading: false})
				this.handleCloseModal()	
			}).catch((e) => {
				this.setState({loading: false})
				console.log(e)
				console.log("Trade was unsuccesful.")
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

	handleTrade(id, amountEth, account, event) {
		event.preventDefault()

		this.state.TradeNetwork.deployed().then((instance) => {
			instance.claimTrade.sendTransaction(id, {from: account, value: amountEth})
		})
	}

  	getEvents() {
  		this.state.web3.eth.getAccounts((error, accounts) => {
	  		this.state.TradeNetwork.deployed().then((instance) => {
	 			let event = instance.NewTrade({}, {fromBlock: 0, toBlock: 'latest'})
	  			event.get((error, logs) => {
	  				logs.reverse()
	  				console.log(logs)
	  				var table = logs.map((log, index) => {
	  					return [
	  						log.args._id.toNumber(),
	  						log.args._from, 
	  						this.state.web3.fromWei(log.args._amountONYX.toNumber(), "ether"),
	  						this.state.web3.fromWei(log.args._amountETH.toNumber(), "ether"),
	  						moment(log.args._timestamp.toNumber()).format("MM/DD/YYYY hh:mm:ss A"),
	  						<button className="button pure-button" onClick={(e) => this.handleTrade(log.args._id, log.args._amountETH, accounts[0], e)}>Trade</button>
	  					]
	  				})
	  				let closeEvent = instance.CloseTrade({}, {fromBlock: 0, toBlock: 'latest'})
		  			closeEvent.get((error, logs) => {
		  				console.log(logs)
		  				var closeTable = logs.map(log => {
		  					return [
		  						log.args._id,
		  						log.args._from,
		  						log.args._to,
		  						this.state.web3.fromWei(log.args._amountONYX.toNumber(), "ether"),
		  						this.state.web3.fromWei(log.args._amountETH.toNumber(), "ether"),
		  						moment(log.args._timestamp.toNumber()).format("MM/DD/YYYY hh:mm:ss A")
		  					]
		  				})
		  				closeTable = closeTable.reduce((result, filter) => {
						    result[filter[0]] = filter;
						    return result;
						},{})
						table = table.filter(function(entry) {
							return !(entry[0] in closeTable)
						})
						table = table.map((entry, index) => {
	  						entry[1] = entry[1].slice(0,20) + "..."
	  						var output_map = {"headers":[entry[3]/entry[2], entry[2] + " ONYX"], "vals":[
	  							{"from": entry[1]},
	  							{"Eth Needed": entry[3]},
	  							{"trade": entry[5]}
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
		var button_text = ""
		if(this.state.modalXHover) {
			x_class = "fa fa-2x fa-times-circle modal-exit"
		} else {
			x_class = "fa fa-2x fa-times-circle-o modal-exit"
		}
		if(this.state.loading) {
			button_text = <BeatLoader color={'white'} loading={this.state.loading} />
		} else {
			button_text = "Place Sell Order"
		}
		var headers = ["Price (ETH/ONYX)", "# ONYX"]
		var table = {
			headers:headers,
			data:this.state.tableData
		}
		return (
	        <main>
	          	<Header
	          		text="> Trade ONYX"
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
				    	<input className="requester-form-entry" value={this.state.numSell} onChange={this.handleNumChange} disabled={this.state.loading} id="name" placeholder="# ONYX" />
				    	<input className="requester-form-entry" value={this.state.priceSell} onChange={this.handlePriceChange} disabled={this.state.loading} id="strike_price" placeholder="Sell Price (ETH/ONYX)" />
				    	<button className="button-xlarge pure-button transfer-button">{button_text}</button>
					</form>
					<div className="modal-bottom">
					</div>
    			</ReactModal>
	        </main>
		)
	}
}

export default Transfer