import React, { Component } from "react";
import API from "./api/API";
import "./App.css";
import { Switch, Redirect, Route, withRouter } from "react-router-dom";
import Nav from "./components/nav";
import Body from "./components/body";
import DisplayScreen from "./components/DisplayScreen";
import OfficerScreen from "./components/OfficerScreen";
import { DISPLAY } from "./shared/displayScreen";
import ManagerScreen from './components/ManagerScreen';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: 0,
      gotTicket: 0,
      ticket: {},
      ticketList: [],
      services: [],
      ticketToCall: 453,
    };
  }

  componentDidMount() {
    //Returns list of services , save them on the state and pass them to the components through props
    API.getServices()
      .then((services) => {
        this.setState({ services: services });
      })
      .catch((err) => console.log(err));

    //Get list of tickets served (as public screen), store in the state

    //
  }

  //Request new tocket to service (as customer)
  getTicket = (serviceId) => {
    //console.log("The request : " + serviceId + ", has been selected");
    this.setState({ inProgress: 1 });
    API.getTicket(serviceId)
      .then((ticket) => {
        this.setState({ ticket: ticket });
        this.setState({ inProgress: 0, gotTicket: 1 });
      })

      .catch((errorObj) => {
        this.handleErrors(errorObj);
      });
  };

  //return to choosing a new ticket
  handleReturn = () => {
    this.setState({ inProgress: 0, gotTicket: 0 });
  };

  callTicketAsOfficer = (counterId) => {
    //this.setState({ticketToCall: 9});

    API.getTicketToServe(counterId)
      .then((ticket) => {
        this.setState({ ticketToCall: ticket }); // does this work? maybe ticket.something
      })
      .catch((errorObj) => {
        console.log(errorObj);
        //this.handleErrors(errorObj);
      });
  };

  servedTicketLists = () => {
    API.getListOfServedTickets()
      .then((ticketLists) => {
        this.setState({
          ticketList: ticketLists || [],
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  render() {
    return (
      <>
        <Nav />
        <Switch>
          <Route exact path="/home">
            <DisplayScreen
              ticketList={this.state.ticketList}
              servedTicketLists={this.servedTicketLists}
            />
            <Body
              gotTicket={this.state.gotTicket}
              ticket={this.state.ticket}
              handleReturn={this.handleReturn}
              inProgress={this.state.inProgress}
              services={this.state.services}
              onClick={this.getTicket}
            />
          </Route>
          <Route path="/officer">
            <OfficerScreen
              ticketToCall={this.state.ticketToCall}
              callTicket={this.callTicketAsOfficer}
            />
          </Route>
          <Route path="/manager">
            <ManagerScreen/>
          </Route>
          <Redirect from="/" exact to="/home" />
        </Switch>
      </>
    );
  }
}

export default withRouter(App);
