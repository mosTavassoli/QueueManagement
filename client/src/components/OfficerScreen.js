import React from "react";
import { Col, Container, Row, Button, FormGroup } from "react-bootstrap";

class OfficerScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      called: true,
      counterChosen: false,
      count: 0,
      show: false,
    };
  }

  served() {
    this.setState({ called: true });
  }

  callCitizen() {
    this.props.callTicket(this.state.count);
    this.setState({
      called: false,
      show: true,
    });
  }

  choseCounter(event) {
    event.preventDefault();
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (value !== "none") {
      this.setState({ counterChosen: true });
      this.setState({ [name]: value });
    } else {
      this.setState({ counterChosen: false, show: false });
    }
  }

  render() {
    return (
      <>
        <Container fluid>
          <h1 className="center mt-5">Welcome Officer</h1>
          <Row className="justify-content-md-center">
            <h4 className="mt-3">Select counter:</h4>
          </Row>
          <form onSubmit={this.choseCounter.bind(this)}>
            <Row className="justify-content-md-center mt-1">
              <Col md={{ span: 2 }}>
                <FormGroup>
                  <select
                    className="form-control"
                    role={this.state.role}
                    onChange={this.choseCounter.bind(this)}
                    name="count"
                  >
                    <option value="none">none</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </FormGroup>
              </Col>
            </Row>
          </form>
        </Container>

        {this.state.counterChosen ? (
          <Container>
            <Row className="justify-content-md-center">
              <Button
                variant="primary"
                className="mt-3"
                size="md"
                onClick={this.callCitizen.bind(this)}
              >
                Call next citizen
              </Button>
            </Row>
          </Container>
        ) : (
          <></>
        )}

        {this.state.show ? (
          <>
            <Container>
              <Row className="justify-content-md-center">
                <div style={{ fontSize: 80 }}>
                  Ticket number: {this.props.ticketToCall}
                </div>
              </Row>
            </Container>
          </>
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default OfficerScreen;

// import React from "react";
// import { Col, Container, Row, Button } from "react-bootstrap";

// class OfficerScreen extends React.Component {
//     constructor(props) {
//         super(props)

//     }

//     state = {
//         called: true,
//         counterChosen: false,
//         count: 0
//     };

//     served(){
//         this.setState({called: true})
//     }

//     callCitizen(){

//         this.props.callTicket(this.state.count)
//         this.setState({called: false})

//     }

//     choseCounter(event){
//         event.preventDefault()
//         this.setState({counterChosen: true})
//         this.setState({count: this.refs.counter.value})

//     }

//     render() {
//     if(this.state.counterChosen){
//     if(this.state.called){
//       return (
//         <Container>
//         <Row className="justify-content-md-center">

//         <Button variant="primary" className='mt-5' size="lg" onClick={this.callCitizen.bind(this)}>
//         Call next citizen
//         </Button>

//         </Row>
//         </Container>
//       );
//     }else{
//         return (
//             <Container>
//             <Row className="justify-content-md-center" >
//             <div style={{fontSize: 80}}>
//                 Ticket number: {this.props.ticketToCall}
//             </div>
//             </Row>
//             <Row className="justify-content-md-center">

//             <Button variant="success" className='mt-3' size="lg" onClick={this.served.bind(this)}>
//             Ticket served
//             </Button>

//             </Row>
//             </Container>
//           );
//     }}else{
//         return(
//         <Container>
//             <Row className="justify-content-md-center">
//                 <div className='mt-3'>Select counter:</div>
//             </Row>
//                 <form onSubmit={this.choseCounter.bind(this)}>
//             <Row className="justify-content-md-center ">
//                 <input className='mt-3' type="number" ref="counter" defaultValue="1"></input>
//             </Row>
//             <Row className="justify-content-md-center">
//                 <Button className='mt-3' variant="primary" type="submit">Submit</Button>
//             </Row>
//             </form>

//         </Container>);
//     }
//     }
//     }

// export default OfficerScreen;
