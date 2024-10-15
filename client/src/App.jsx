
import React from 'react';
import Phase0 from './routes/Phase0';
import Phase1 from './routes/Phase1';
import Phase2 from './routes/Phase2';
import Phase3 from './routes/Phase3';
import Layout from './Layout';
import Login from './routes/Login';
import ErrorServer from './components/ErrorServerPage';
import CreateProposal from './routes/CreateProposal';
import EditProposal from './routes/EditProposal';

import GeneralPageComponent from './components/GeneralPageComponent';
import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';


function App() {

  const NotFound = function () {
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
                  <Alert.Heading ><h2>404</h2></Alert.Heading>
                  <p className='h3'>Page Not Found!</p>
                </Alert>
              </Col>
            </Row>
          </center>

        </div>
      </Container>
    )
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Layout />}>
          <Route path='/' element={<GeneralPageComponent />} />
          <Route path="/phase0" element={<Phase0 />} />
          <Route path="/phase1" element={<Phase1 />} />
          <Route path="/phase2" element={<Phase2 />} />
          <Route path="/phase3" element={<Phase3 />} />
          <Route path='/server_error' element={<ErrorServer />} />
          <Route path='/404' element={< NotFound />} />
          <Route path='/create_proposal' element={<CreateProposal />} />
          <Route path='/edit_proposal/:id' element={<EditProposal />} />
        </Route>

        <Route path='*' element={<GeneralPageComponent />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
