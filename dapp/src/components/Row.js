import React, { Component } from 'react'

class Row extends Component {
  render() {
  	var i = 0;
    let row = this.props.data.map(column => {
    	i++
        return <td key={i}>{column}</td>
    })
    if(this.props.index % 2 === 0) {
    	return (
      		<tr className="active-row">{row}</tr>
    	)
    } else {
    	return (
      		<tr className="active-row">{row}</tr>
    	)
    }

  }
}

export default Row