import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import ReqEngContractFactory from '../../build/contracts/ReqEngContractFactory.json'
import ReqEngContract from '../../build/contracts/ReqEngContract.json'
import getWeb3 from '../utils/getWeb3'

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr;

class Toaster extends Component {
	constructor(props) {
		super(props)

		this.state = {
			ToastMessageFactory: React.createFactory(ReactToastr.ToastMessage.animation),
			web3: "",
			Onyx: "",
			Factory: "",
			REContract: "",
		}
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
				  		this.valToast(result)
					}
				})
				var reqVal = factory.Validated({_req: accounts[0]}, {fromBlock: "latest"})
				reqVal.watch((error, result) => {
					if (error == null) {
				  		this.reqValToast(result)
					}
				})
				var deploy = factory.Deployed({_req: accounts[0]}, {fromBlock: "latest"})
				deploy.watch((error, result) => {
					if (error == null) {
				  		this.deployToast(result)
					}
				})
				var claim = factory.Claimed({_eng: accounts[0]}, {fromBlock: "latest"})
				claim.watch((error, result) => {
					if (error == null) {
				  		this.claimToast(result)
					}
				})
				var fail = factory.Failed({_eng: accounts[0]}, {fromBlock: "latest"})
				fail.watch((error, result) => {
					if (error == null) {
				  		this.failToast(result)
					}
				})
		    })
		})
  	}

  	deployToast(result) {
  		this.container.success(
      		"Your request has been deployed",
      		this.state.web3.toAscii(result.args._name.replace(/0+$/g, "")), {
      		timeOut: 3000,
      		extendedTimeOut: 3000,
      		closeButton:true,
    	});
  	}

  	claimToast(result) {
  		this.container.success(
      		"This request has been claimed",
      		this.state.web3.toAscii(result.args._name.replace(/0+$/g, "")), {
      		timeOut: 3000,
      		extendedTimeOut: 3000,
      		closeButton:true,
    	});
  	}

  	valToast(result) {
  		this.container.success(
      		"Your code has been validated",
      		this.state.web3.toAscii(result.args._name.replace(/0+$/g, "")), {
      		timeOut: 3000,
      		extendedTimeOut: 3000,
      		closeButton:true,
    	});
  	}

  	reqValToast(result) {
  		this.container.success(
      		"Your request has been validated",
      		this.state.web3.toAscii(result.args._name.replace(/0+$/g, "")), {
      		timeOut: 3000,
      		extendedTimeOut: 3000,
      		closeButton:true,
    	});
  	}

  	failToast(result) {
  		this.container.error(
      		"Your code has failed validation",
      		this.state.web3.toAscii(result.args._name.replace(/0+$/g, "")), {
      		timeOut: 3000,
      		extendedTimeOut: 3000,
      		closeButton:true,
    	});
  	}
	
	render() {
		return(
	      	<div>
	        	<ToastContainer ref={(input) => {this.container = input;}}
	                        toastMessageFactory={this.state.ToastMessageFactory}
	                        className="toast-top-right" />
	        </div>		
	    )
	}
}

export default Toaster