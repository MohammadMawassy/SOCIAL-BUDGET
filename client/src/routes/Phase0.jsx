import { Row, Col, Container, Alert, Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import ProposalService from '../services/proposalService';
import { useNavigate } from 'react-router-dom';

import secureLocalStorage from 'react-secure-storage';
import { PHASES } from '../utils/generals';
import validator from 'validator';


const Phase0 = () => {

    const service = new ProposalService();
    const navigate = useNavigate();
    const [error, setError] = useState({});
    const [requestError, setRequestError] = useState(null);
    const [budget, setBudget] = useState(0);



    useEffect(() => {

        const checkPhase = async () => {
            try {
                const newPhase = await service.getPhase();
                if (newPhase !== 'phase0') {
                    if (Object.values(PHASES).includes(newPhase.toLowerCase())) {
                        navigate(`/${newPhase.toLowerCase()}`);
                    }
                    else {
                        navigate('/404');
                    }
                }

            } catch (error) {
                console.log(error);
                navigate('/404');
            }
        }

        checkPhase();  

        return () => {  // cleanup
            setBudget(0);
            setError({});
            setRequestError(null);
        };

    }, []);


    const handleInputChange = (e) => {
        e.preventDefault();
        setError({});   
        const { name, value } = e.target;
        if (value < 0) {
            setError({ ...error, [name]: 'Budget must be a positive number' }); 
            return;
        }
        setBudget(value);
        setError({ ...error, [name]: null });   
    }


    const onCancel = (e) => {
        e.preventDefault();    
        setBudget(0);
        setError({});   
    }


    const submit = async (e) => { 
        e.preventDefault();
        try {
            let newError = {};
            if (!budget || budget == 0) {
                newError.budget = 'Budget is required';
            }

            if (!validator.isInt(budget.toString())) {
                newError.budget = 'Budget must be a whole number';
            }

            setError(newError);

            if (newError && Object.keys(newError).length > 0) {
                return;
            }

            const newPhase = await service.setBudget(budget);
            setBudget(null);
            navigate('/phase1');

        } catch (err) {
            console.log(err);   
            if (err?.response?.data?.type === 'UNAUTHENTICATED' || err?.response?.data?.type === 'UNAUTHORIZED') {  
                secureLocalStorage.removeItem('loggedUser');    
                return;
            }
            setRequestError(err?.response?.data?.message || 'Something went wrong');
        }
    }


    return (
        <Container fluid>
            {(secureLocalStorage.getItem('loggedUser') && secureLocalStorage.getItem('loggedUser')?.role === 'admin') &&
                <>
                    <Row className='mt-4'>
                        <Col className='ms-4 mb-4  d-flex justify-content-center'>
                            <h1>Phase 0</h1>
                        </Col>
                    </Row>

                    <div className='phase0-container'>

                        <Row className="mb-2">
                            <Col>
                                {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible>
                                    <p>
                                        {requestError}
                                    </p>
                                </Alert>}
                            </Col>
                        </Row>

                        <Form.Group as={Row} className="mb-3" controlId="formUsername">

                            <Form.Label column sm="7" className='set-budget-label'>Set Budget: </Form.Label>
                            <Col sm="4">
                                <Form.Control type="number" name="budget" min={0} className='budget-control' placeholder="Set Budget" value={budget} onChange={(e) => handleInputChange(e)} isInvalid={error?.budget} />
                                <Form.Control.Feedback type="invalid">
                                    {error.budget}
                                </Form.Control.Feedback>
                            </Col>
                            <Form.Label column sm="1" className='set-budget-label'>€</Form.Label>
                        </Form.Group>
                        <Row>
                            <Col className='d-flex justify-content-start'>
                                <Button variant="danger" type="button" className='me-3' onClick={onCancel} >
                                    Cancel
                                </Button>
                                <Button variant="primary" type="button" onClick={submit} >
                                    Confirm
                                </Button>
                            </Col>
                        </Row>

                    </div>

                </>
            }

            {(secureLocalStorage.getItem('loggedUser') && secureLocalStorage.getItem('loggedUser')?.role === 'user') &&
                <>
                    <div className='alert-component'>
                        <center>
                            <Row className='mb-5'>
                            </Row>
                            <Row className='mb-5'>
                            </Row>
                            <Row>
                                <Col>
                                    <Alert variant='danger' >
                                        <p className='h3'>Proposal page is still close!</p>
                                    </Alert>
                                </Col>
                            </Row>
                        </center>
                    </div>
                </>
            }

            {!secureLocalStorage.getItem('loggedUser') &&
                <>
                    <div className='alert-component'>
                        <center>
                            <Row className='mb-5'>
                            </Row>
                            <Row className='mb-5'>
                            </Row>
                            <Row>
                                <Col>
                                    <Alert variant='danger' >
                                        <p className='h3'>Proposal definition page is ongoing!</p>
                                    </Alert>
                                </Col>
                            </Row>
                        </center>
                    </div>
                </>
            }

        </Container>
    )
};

export default Phase0;