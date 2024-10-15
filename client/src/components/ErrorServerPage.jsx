import { Container, Row, Col, Alert } from "react-bootstrap";


const ErrorServer = () => {

    return (
        <Container fluid className='mt-5'>
            <div className='alert-component'>
                <center>
                    <Row className='mb-5'>
                    </Row>
                    <Row className='mb-5'>
                    </Row>
                    <Row>
                        <Col>
                            <Alert variant='danger' >
                                <Alert.Heading ><h2>400</h2></Alert.Heading>
                                <p className='h3'>Server Error</p>
                            </Alert>
                        </Col>
                    </Row>
                </center>

            </div>
        </Container>);
}  ;

export default ErrorServer; 