import React, { Component, Fragment } from "react";
import CounterList from "./counterList";

class Body extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <div className="container-fluid">
        <div className="row">
        
       {/* <Sidebar cats={this.props.cats} brands={this.props.brands}  onClick={this.props.onClick}/> */}
       <CounterList onClick={this.props.onClick} counters={this.props.counters}/>
       </div></div>
      </Fragment>
    );
  }
}

export default Body;
