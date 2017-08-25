import React, { Component } from 'react'
import Row from './Row'

class Table extends Component {
  render() {
    let headers = this.props.table.headers.map(header => {
      return <th key={header}>{header}</th>
    })
    var i = 0
    let rows = this.props.table.data.map(entry => {
      i++
      return <Row key={
        entry[0]
      }
      data={
        entry
      }
      index={
        i
      }
      />
    })
    var classes = "pure-table pure-table-horizontal " + this.props.classes
    return (
      <table className={classes} >
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

export default Table