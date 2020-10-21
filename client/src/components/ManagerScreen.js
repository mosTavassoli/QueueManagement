import React from "react";
import { Col, Container, Row, Table } from "react-bootstrap";

//vettore_counter = new Array();
//vettore_counter[0];

function insertCounter(){
  var n = window.prompt("Counter:", "Insert here");
  var m = window.prompt("Service list (separeted by space):", "Insert here");
}

var vettore_counter = [{
    service_list: new Array("Service 1"),
    counterId: 1
}, {
    service_list: new Array("Service 1", "Service 2"),
    counterId: 2
}, {
    service_list: new Array("Service 1", "Service 2"),
    counterId: 3
}, {
    service_list: new Array("Service 3"),
    counterId: 4
}]


class ManagerScreen extends React.Component{
    constructor(props) {
        super(props)
        
    }
    render() {
        return(
                <div> 
                    <h1 align='center' >Hello Manager!</h1>
                    <Table striped bordered   className="text-center display  mt-3">
                      <thead>
                        <tr>
                          <th>CounterId</th>
                          <th>Service</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vettore_counter.map((service) => (
                          <tr>
                            <td>{service.counterId}</td>
                            <td>{service.service_list+''}</td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                   
                    <button onClick={insertCounter}>Add a new Counter</button>
                   
                </div>
                
        
                
                   
                   
        )         
            
    }
    
    

}

export default ManagerScreen;