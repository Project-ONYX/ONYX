import React, { Component } from 'react'

class DownloadFrame extends Component {
  render() {
  	return (
	  	<div style={{display: 'none'}}>
	  		<iframe src={this.props.iframeSrc} />
	  	</div>
  	)
  }
}

export default DownloadFrame