import React, { Component, Fragment } from "react";

class CounterList extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <main role="main" className="main mt-5 p-lg-4 p-xl-4 p-md-4 p-sm-4 col-md-12 ml-sm-auto col-lg-12 px-md-4">
          
          <h3 className="mb-2">Please select a new Ticket</h3>
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
              <tbody >
                {this.props.counters.map((counter) => (
                  <CounterRow
                    key={counter.id}
                    counter={counter}
                    onClick={this.props.onClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </Fragment>
    );
  }
}
function CounterRow(props) {
  return (
    <tr  counterid={props.counter.id}>
      <CounterData counter={props.counter} onClick={props.onClick} />
    </tr>
  );
}
function CounterData(props) {
  return (
    <>
      <td>{props.counter.id}</td>
      <td>{props.counter.name}</td>
      <td>{props.counter.counters}</td>
      <td>
        <button
         className="btn btn-outline-success"
          value={props.counter.id}
          onClick={() => {
            props.onClick(props.counter.name);
          }}
        >
          New Ticket
        </button>
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
