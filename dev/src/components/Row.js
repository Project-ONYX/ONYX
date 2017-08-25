import React, { Component } from 'react'

class Row extends Component {
  render() {
    let row = this.props.data.map(column => {
      return <td key={column}>{column}</td>
    })
    return (
      <tr>{row}</tr>
    )
  }
}

export default Row