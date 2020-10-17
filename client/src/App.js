import React, { Component } from 'react';
import API from './api/API';
import './App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Nav from './components/nav';
import Body from './components/body';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
       ]}
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
  submitRequest = (req_type) => {
      console.log("The request : " + req_type + ", has been selected");
      // API.submitRequest(req_type)
      // .then((counters) => this.setState({counters}))
      // .catch((errorObj) => {
      //   this.handleErrors(errorObj);
      // });
    
  }
  
  render() { 
    return ( 
      
      
      <Router>
      <Nav/>
      
        <Body counters={this.state.counters} onClick={this.submitRequest} />
        {/* <Switch>
          <Route path="/" exact component={Body} />
          <Route path="/counters" component={CarList}/>
        </Switch> */}
      </Router>
     );
  }
}
 
export default App;