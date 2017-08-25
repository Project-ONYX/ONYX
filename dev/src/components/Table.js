import React, { Component } from 'react'
import Row from './Row'

class Table extends Component {
  render() {
    let headers = this.props.table.headers.map(header => {
      return <th key={header}>{header}</th>
    })
    let rows = this.props.table.data.map(entry => {
      return <Row key={
        entry[0]
      }
      data={
        entry
      }
      />
    })
    return (
      <table className="pure-table" >
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

export default Table