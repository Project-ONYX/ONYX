import React, { Component } from 'react'
import Header from '../components/Header'

class Disclaimer extends Component {
	render() {
		return (
	        <main>
	        	<Header 
	        		text="> Disclaimer"
	          	/>
	        	<div className="container disclaimer-container">
		        	Project ONYX is still a project in very early stages and should not be used for any production application at this time. If you decide to do it anyway,
		        	Project ONYX is not responsible for any potential damages or security breaches that may occur. If you have any questions/concerns please contact the team on slack.
			    </div>
	        </main>
		)
	}
}

export default Disclaimer