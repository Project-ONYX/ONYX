import React, { Component } from 'react'
import OnyxTokenContract from '../../build/contracts/OnyxToken.json'
import getWeb3 from '../utils/getWeb3'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../lib/font-awesome/css/font-awesome.min.css'
import '../css/App.css'

import Header from '../components/Header'
import Main from './Main'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      account: null,
      balance: 0,
      Onyx: null,
      web3: null
    }
  }

  updateBalance() {
    // Declaring this for later so we can chain functions on OnyxToken.
    var OnyxInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.Onyx.deployed().then((instance) => {
        OnyxInstance = instance
        this.setState({ account: accounts[0] })
        // Get the value from the contract to prove it worked.
        return OnyxInstance.balanceOf.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ balance: result.c[0] })
      })
    })
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

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
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const Onyx = contract(OnyxTokenContract)
    Onyx.setProvider(this.state.web3.currentProvider)

    this.setState({ Onyx: Onyx })

    var onyx

    this.state.Onyx.deployed().then(function(instance) {
      onyx = instance
      var transfers = onyx.Transfer({fromBlock: "latest"})
      transfers.watch(function(error, result) {
        if (error == null) {
          this.updateBalance()
        }
      })
    })

    this.updateBalance()
  }

  render() {
    return (
      <div className="App">
        <Header 
          account={this.state.account}
          balance={this.state.balance}
        />
        <Main 
          web3={this.state.web3}
        />
      </div>
    )
  }
}

export default App
