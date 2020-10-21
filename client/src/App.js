import React, { Component } from 'react';
import API from './api/API';
import './App.css';
import {BrowserRouter as Switch, Route} from 'react-router-dom';
import Nav from './components/nav';
import Body from './components/body';
import DisplayScreen from './components/DisplayScreen';
import OfficerScreen from './components/OfficerScreen';
import {DISPLAY} from './shared/displayScreen';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
        inProgress : 0,
        gotTicket:0,
        displayList : DISPLAY,
        ticket:{},
        ticketList:[],
       counters:[
         {
           id : 1,
           name: "Send Package",
           counters : "1,2,3"
         },
         {
           id : 2,
           name: "Openning Acount",
           counters : "2,3"
         },
         {
           id : 3,
           name: "Tracking Packages",
           counters: "4"
         }
       ],
       ticketToCall: 453
      }
  }
  
  componentDidMount(){
    //Returns list of counters with the counters they are associated with , save them on the state and pass them to the components through props
    // API.getcounters(0,0)
    // .then((counters)=>{this.setState({counters})})
    // .catch((err)=>console.log(err));

    

    //Get list of tickets served (as public screen), store in the state


    //
  }


  //Request new tocket to service (as customer)
  getTicket = (serviceId) => {
      //console.log("The request : " + serviceId + ", has been selected");
      this.setState({inProgress:1});
      console.log(serviceId);
      API.getTicket(serviceId)
      .then((ticket) => {
        console.log(ticket);
        this.setState({ticket:ticket});
        this.setState({inProgress:0, gotTicket:1});})
      .catch((errorObj) => {
        this.handleErrors(errorObj);
        console.log('there is an error')
      });
  }

  //return to choosing a new ticket
  handleReturn =()=>{
    this.setState({inProgress:0, gotTicket:0});
    console.log("I handled it")
  };

  callTicketAsOfficer = (counterId) => {
    
    //this.setState({ticketToCall: 9});

    API.getTicketToServe(counterId)
    .then((ticket) => {
      
      this.setState({ticketToCall: ticket}); // does this work? maybe ticket.something
    })
    .catch((errorObj) => {
      
      console.log(errorObj);
      //this.handleErrors(errorObj);
    });
  }

  servedTicketLists = () => {
    API.getListOfServedTickets()
      .then((ticketLists) => {
         this.setState({
          ticketList: ticketLists || [],
        })
      }     
      )
      .catch((errorObj) => {
        this.setState({
          err: errorObj.errors[0].msg,
        });
      });
  };
  
  render() { 
    return ( 
      <>
      <Nav/>
      <Switch>
        <Route exact path="/">
        <DisplayScreen ticketList={this.state.ticketList} servedTicketLists={this.servedTicketLists}/>
        <Body
        gotTicket={this.state.gotTicket} ticket={this.state.ticket} handleReturn={this.handleReturn}
        inProgress={this.state.inProgress} counters={this.state.counters} onClick={this.getTicket} />
        {/* <Switch>
          <Route path="/" exact component={Body} />
          <Route path="/counters" component={CarList}/>
        </Switch> */}
      </Route>
      <Route path="/officer">
        <OfficerScreen ticketToCall={this.state.ticketToCall} callTicket={this.callTicketAsOfficer}/>
      </Route>
      </Switch>
      
        
      
      </>
     );
  }
}
 
export default App;