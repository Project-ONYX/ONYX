import React, { Component } from 'react'
import DetailedRow from './DetailedRow'

class DetailedTable extends Component {
  render() {
    let headers = this.props.table.headers.map((header, index) => {
      if(index === 0) {
        return <div key={header} className="detailedColumn">{header}</div>
      } else {
        return <div key={header} className="detailedColumnRight">{header}</div>
      }
    })
    var i = 0
    let rows = this.props.table.data.map((entry, index) => {
      i++
      return <DetailedRow key={
        index
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
      <div className={classes} >
        <div>
          <div className="tableHeaders">{headers}</div>
        </div>
        <div className="scrollable-rows">{rows}</div>
      </div>
    );
  }
}

export default DetailedTable