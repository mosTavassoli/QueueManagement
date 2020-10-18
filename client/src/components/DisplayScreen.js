import React from "react";
import { Col, Container, Row, Table } from "react-bootstrap";

class DiaplayList extends React.Component {
    render(){
        return(
            <Container>
              <Row>
                <Col md={2}></Col>
                <Col md={8}>
                    <Table striped bordered hover size="sm" className="mt-5">
                      <thead>
                          <tr><th  colSpan="3" className="center">In Service</th></tr>
                        <tr>
                          <th>Ticket NO.</th>
                          <th>Counter No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.displayList?.map((display, index) => (
                          
                          <tr key={index}>
                            <td>{display.ticketId}</td>
                            <td>{display.counterId}</td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <Table striped bordered hover size="sm" className="mt-3">
                      <thead>
                        <tr>
                          <th>Queue Length</th>
                          <th>Ticket Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.displayList?.map((display, index) => (
                          <tr key={index}>
                            <td>{display.queueLength}</td>
                            <td>{display.ticketType}</td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                </Col>
              </Row>
            </Container>
        )
    }
}

export default DiaplayList;