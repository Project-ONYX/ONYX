import React, { Component } from 'react'

class Header extends Component {
	render() {
		return (
		    <nav className="navbar pure-menu pure-menu-horizontal">
		        <a href="/" className="pure-menu-heading pure-menu-link">Project ONYX</a>
		        <ul className="pure-menu-list">
		          <li className="pure-menu-item"><a href="/Requester/Deployed" className="pure-menu-link">Requester</a></li>
		          <li className="pure-menu-item"><a href="/Engineer/Claims" className="pure-menu-link">Engineer</a></li>
                  <li className="pure-menu-item"><a href="/Mint" className="pure-menu-link">Mint</a></li>
		          <li className="pure-menu-item"><a href="/Transfer" className="pure-menu-link">Transfer</a></li>
		        </ul>
		        <ul className="pure-menu-list pull-right">
		          <li className="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
		            <a href="#" id="menuLink1" className="pure-menu-link">{this.props.account}</a>
		            <ul className="pure-menu-children">
			          <li className="pure-menu-item"><i className="fa fa-5x fa-user-circle-o" aria-hidden="true"></i></li>
		              <li className="pure-menu-item"><a href="#" className="pure-menu-link">Balance: {this.props.balance} ONYX</a></li>
		            </ul>
		          </li>
		        </ul>
		    </nav>
		)
	}
}

export default Header