import React, { Component } from 'react'

class DetailedRow extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rowClasses: "accordian",
      panelClasses: "accordian-panel"
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    if(this.state.rowClasses === "accordian") {
      this.setState({rowClasses:"accordian active", panelClasses: "accordian-panel show"})
    } else {
      this.setState({rowClasses: "accordian", panelClasses: "accordian-panel"})
    }
  }

  render() {
    // var data = {header: [MAX 2], vals: []}
    let row = this.props.data.headers.map((column, index) => {
      if(index === 0) {
        return <div key={index} className="detailedColumn"><strong>{column}</strong></div>
      }
      else {
        return <div key={index} className="detailedColumn detailedColumnRight"><strong>{column}</strong></div>

      }
    })
    let panel = this.props.data.vals.map((values, index) => {
      var name = Object.keys(values)[0]
      var value = values[name]
      return <p key={index}> <strong>{name}</strong> : {value} </p>
    })
  	return (
  		<div className="detailedRow">
        <div className={this.state.rowClasses}  onClick={this.handleClick}>
          {row}
        </div>
        <div className={this.state.panelClasses}>
          {panel}
        </div>
      </div>
  	)
  }
}

export default DetailedRow