import React, { Component } from 'react'
import Header from '../components/Header'

import Logo from "../../public/logo.svg"

class Home extends Component {
	render() {
		return (
	        <main>
	        	<Header 
	        		text="> Home"
	          	/>
	        	<div className="container home-container">
		        	<div className="logo-holder">
			            <img src={Logo} className="logo" alt="logo" />
			            <h1>Project Onyx</h1>
			            <h2>(Alpha Build)</h2>
			        </div>
			    </div>
	        </main>
		)
	}
}

export default Home