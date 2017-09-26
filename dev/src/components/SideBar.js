import React, { Component } from 'react'
import onClickOutside from 'react-onclickoutside'

class SideBar extends Component {
	constructor(props) {
		super(props)

		this.state = {
			active: "",
			req_active: "",
			eng_active: "",
			accordianClasses: "side-panel-accordian",
			panelClasses: "side-panel-accordian-panel"
		}

		this.handleCollapse = this.handleCollapse.bind(this);
	    this.handleClick = this.handleClick.bind(this)
	}

	handleCollapse() {
		if(this.state.active === " active") {
			this.setState({active: ""});
		} else {
			this.setState({active: " active"});
		}
	}

	handleClick() {
		if(this.state.accordianClasses === "side-panel-accordian") {
	  		this.setState({accordianClasses:"side-panel-accordian active", panelClasses: "side-panel-accordian-panel show"})
		} else {
			this.setState({accordianClasses: "side-panel-accordian", panelClasses: "side-panel-accordian-panel"})
		}
	}

	handleClickOutside() {
		if(this.state.active === " active") {
			this.setState({active: ""});
		}
	}

	render() {
		return (
			<div id="sidebar" className={this.state.active}>
				<a href="#menu" id="menuLink" onClick={() => this.handleCollapse()} className={"menu-link" + this.state.active}>
			        <span></span>
			    </a>
				<div id="menu" className={this.state.active}>
					<div className="pure-menu custom-restricted-width">
						<a className="pure-menu-heading" href="/">Project <strong>ONYX</strong></a>
						<ul className="pure-menu-list">
							<li className="pure-menu-item icon">
								<i className="fa fa-5x fa-user-circle-o fa-user-icon" aria-hidden="true"></i>
								<p className="pure-menu-item">{this.props.account.slice(0,20) + "..."}</p>
								<p className="pure-menu-item">Balance: {this.props.balance} ONYX</p>
							</li>
							<li className="pure-menu-item"><a href="/Requester" className="pure-menu-link">Requester</a></li>
							<li className="pure-menu-item"><a onClick={this.handleClick} className={"pure-menu-link " + this.state.accordianClasses}>Engineer</a>
								<div className={this.state.panelClasses}>
									<ul className="pure-menu-list">
										<li className="pure-menu-item"><a href="/Engineer" className="pure-menu-link">My Profile</a></li>
										<li className="pure-menu-item"><a href="/Marketplace" className="pure-menu-link">Marketplace</a></li>
									</ul>
								</div>
							</li>
							<li className="pure-menu-item"><a href="/Transfer" className="pure-menu-link">Trade ONYX</a></li>
						</ul>
					</div>
				</div>
			</div>
		)
	}
}

// <li className="pure-menu-item"><a href="/Mint" className="pure-menu-link">Mint</a></li>

export default onClickOutside(SideBar)