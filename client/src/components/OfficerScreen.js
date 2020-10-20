import React from "react";
import { Col, Container, Row, Button } from "react-bootstrap";

class OfficerScreen extends React.Component {
    constructor(props) {
        super(props)
        
    }

    state = {
        called: true,
        counterChosen: false,
        count: 0
    };

    served(){
        this.setState({called: true})
    }

    callCitizen(){
        
        this.props.callTicket(this.state.count)
        this.setState({called: false})
        
    }

    choseCounter(event){
        event.preventDefault()
        this.setState({counterChosen: true})
        this.setState({count: this.refs.counter.value})
        
    }

    render() {
    if(this.state.counterChosen){
    if(this.state.called){
      return (
        <Container>
        <Row>
        <Col md={5}></Col>
        <Button variant="primary" style={{marginTop : 20}} onClick={this.callCitizen.bind(this)}>
        Call next citizen
        </Button>
        
        </Row>
        </Container>
      );
    }else{
        return (
            <Container>
            <Row>
            <Col md={5}></Col>
            Ticket number: {this.props.ticketToCall}
            </Row>
            <Row>
            <Col md={5}></Col>
            <Button variant="success" style={{marginTop : 20}} onClick={this.served.bind(this)}>
            Ticket served
            </Button>
            
            </Row>
            </Container>
          );
    }}else{
        return(
        <Container>
            <Row style={{marginTop : 20}}>
                <Col md={4}></Col>
                Select counter:
                <form onSubmit={this.choseCounter.bind(this)}>
                    <input type="number" ref="counter"></input>
                    <Button variant="primary" type="submit">Submit</Button>
                </form>
            </Row>
        </Container>);
    }
    }
    }
  

export default OfficerScreen;