import React from "react";
import { Col, Container, Row, Button } from "react-bootstrap";

class OfficerScreen extends React.Component {
    state = {
        called: false,
        counterChosen: false,
        count: 0
    };

    callCitizen(){
        this.setState({called: !this.state.called})
    }

    choseCounter(event){
        event.preventDefault()
        this.setState({counterChosen: true})
        this.setState({count: this.refs.counter.value})
        console.log(this.refs.counter.value)
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
            <Button variant="success" style={{marginTop : 20}} onClick={this.callCitizen.bind(this)}>
            Ticket served
            </Button>
            
            </Row>
            </Container>
          );
    }}else{
        return(
        <Container>
            <Row>
                <Col md={5}></Col>
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