import React, { Component, Fragment } from "react";

class CounterList extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <main role="main" className="col-md-12 ml-sm-auto col-lg-10 px-md-4">
          <h2>Getting a New Ticket</h2>
          <div className="table-responsive">
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type of Service</th>
                  <th>Available Counters</th>
                </tr>
              </thead>
              <tbody>
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
    <tr counterId={props.counter.id}>
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

function IfAvailable(available) {
  if (available === 0) {
    return "Not Available";
  } else {
    return "Available";
  }
}
export default CounterList;
