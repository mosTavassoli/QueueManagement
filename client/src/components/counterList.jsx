import React, { Component, Fragment } from "react";

class CounterList extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <main
          role="main"
          className="main mt-5 p-lg-4 p-xl-4 p-md-4 p-sm-4 col-md-12 ml-sm-auto col-lg-12 px-md-4"
        >
          {this.props.gotTicket === 0 ? (
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                  <tr className="">
                    <th>#</th>
                    <th>Type of Service</th>
                    <th>Available Counters</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.counters.map((counter) => (
                    <CounterRow
                      key={counter.id}
                      counter={counter}
                      onClick={this.props.onClick}
                      inProgress={this.props.inProgress}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="container ticket p-3 my-2 border">
                <h1>Ticket Number : {this.props.ticket.ticketId}</h1>
                <h5 className="mt-n1 mb-5 pr-2 text-muted">
                  {this.props.ticket.serviceId === 1 && (
                    <p>Service : Openning Account</p>
                  )}
                  {this.props.ticket.serviceId === 2 && (
                    <p>Service : Sending Package</p>
                  )}
                </h5>

                <h5 className="mt-5">
                  People in front of you: {this.props.ticket.queueLength}
                </h5>
              </div>
              <div className="text-center">
                <button onClick={() => {this.props.handleReturn()}} className="btn btn-primary ">
                  Return
                </button>
              </div>
            </>
          )}
        </main>
      </Fragment>
    );
  }
}
function CounterRow(props) {
  return (
    <tr counterid={props.counter.id}>
      <CounterData
        inProgress={props.inProgress}
        counter={props.counter}
        onClick={props.onClick}
      />
    </tr>
  );
}
function CounterData(props) {
  return (
    <>
      <td>{props.counter.id}</td>
      <td>{props.counter.name}</td>
      <td>{props.counter.counters}</td>
      {/*when the button is clicked the spinner will be shown till the data is ready*/}
      <td>
        {props.inProgress === 0 ? (
          <button
            className="btn btn-outline-success"
            value={props.counter.id}
            onClick={() => {
              props.onClick(1);
            }}
          >
            New Ticket
          </button>
        ) : (
          <div className="spinner-border text-success"></div>
        )}
      </td>
    </>
  );
}

// function IfAvailable(available) {
//   if (available === 0) {
//     return "Not Available";
//   } else {
//     return "Available";
//   }
// }
export default CounterList;
