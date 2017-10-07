import React, { Component } from 'react'

class Tile extends Component {
	render() {
		return (
			<div className="tile">
				<div className="tile-title">{this.props.title}</div>
				<div className="tile-body">{this.props.body}</div>
			</div>
		)
	}
}

export default Tile