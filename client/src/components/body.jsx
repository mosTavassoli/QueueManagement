import React, { Component, Fragment } from "react";
import ServiceList from "./serviceList";

class Body extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <div className="container-fluid">
        <div className="row">
        
       {/* <Sidebar cats={this.props.cats} brands={this.props.brands}  onClick={this.props.onClick}/> */}
       <ServiceList
       inProgress={this.props.inProgress} gotTicket={this.props.gotTicket} ticket={this.props.ticket}
       handleReturn={this.props.handleReturn}
       onClick={this.props.onClick} services={this.props.services}/>
       </div></div>
      </Fragment>
    );
  }
}

export default Body;
