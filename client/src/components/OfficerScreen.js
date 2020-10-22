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
        <Row className="justify-content-md-center">
        
        <Button variant="primary" className='mt-5' size="lg" onClick={this.callCitizen.bind(this)}>
        Call next citizen
        </Button>
        
        </Row>
        </Container>
      );
    }else{
        return (
            <Container>
            <Row className="justify-content-md-center" >
            <div style={{fontSize: 80}}>
                Ticket number: {this.props.ticketToCall}
            </div>
            </Row>
            <Row className="justify-content-md-center">
            
            <Button variant="success" className='mt-3' size="lg" onClick={this.served.bind(this)}>
            Ticket served
            </Button>
            
            </Row>
            </Container>
          );
    }}else{
        return(
        <Container>
            <Row className="justify-content-md-center">  
                <div className='mt-3'>Select counter:</div>
            </Row>
                <form onSubmit={this.choseCounter.bind(this)}>
            <Row className="justify-content-md-center ">        
                <input className='mt-3' type="number" ref="counter" value="1"></input>
            </Row>
            <Row className="justify-content-md-center">
                <Button className='mt-3' variant="primary" type="submit">Submit</Button>
            </Row>    
            </form>
            
            
        </Container>);
    }
    }
    }
  

export default OfficerScreen;