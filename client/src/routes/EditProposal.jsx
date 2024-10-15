
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Row, Col, Alert, Container } from "react-bootstrap";
import ProposalService from "../services/proposalService";
import { PHASES } from "../utils/generals";
import secureLocalStorage from 'react-secure-storage';
import validator from 'validator';


const EditProposal = () => {

    const navigate = useNavigate();
    const [error, setError] = useState({});
    const [description, setDescription] = useState('');
    const [requestError, setRequestError] = useState(null);
    const [budget, setBudget] = useState(0);
    const service = new ProposalService();
    const loggedUser = secureLocalStorage.getItem('loggedUser');
    const [perviousBudget, setPreviousBudget] = useState(0);
    const [previousDescription, setPreviousDescription] = useState(''); 
    const { id } = useParams();
    


    useEffect(() => {


        const checkPhase = async () => {
            try {

                if (!loggedUser) {
                    navigate('/');
                    return;
                }

                const newPhase = await service.getPhase();
                if (newPhase !== 'phase1') {
                    if (Object.values(PHASES).includes(newPhase.toLowerCase())) {
                        navigate(`/${newPhase.toLowerCase()}`);
                    }
                    else {
                        navigate('/404');
                    }
                }

            } catch (err) {
                console.log(err);
                navigate('/404');
            }
        }


        const getProposal = async () => {
            try {
                const data = await service.getProposal(id);
                setDescription(data?.description);
                setBudget(data?.budget);
                setPreviousBudget(data?.budget);
                setPreviousDescription(data?.description);
            }
            catch (err) {
                console.log(err);
                if (err.response?.data?.type?.toUpperCase() === 'UNAUTHENTICATED' || err.response?.data?.type?.toUpperCase() === 'UNAUTHORIZED') {
                    secureLocalStorage.removeItem('loggedUser');
                    navigate('/');
                    return;
                }
                requestError(err.response?.data?.message || 'Something went wrong');
            }

        };


        checkPhase();
        getProposal();

        return () => {
            setDescription('');
            setBudget(0);
            setError({});
            setRequestError(null);
            setPreviousBudget(0);
            setPreviousDescription('');
        };


    }, []);



    const handleInputChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        if (name === 'budget') {
            setBudget(value);
            setError({ ...error, [name]: null });
            return;
        }
        if (name === 'description') {
            setDescription(value);
            setError({ ...error, [name]: null });
            return;
        }
    };

    const save = async (e) => {
        e.preventDefault();
        try {
            let newError = {};
            if (!description || description === '') {
                newError.description = 'Description is required';
            }
            if (!budget || budget === 0) {
                newError.budget = 'Budget is required';
            }

            if (!validator.isInt(budget.toString())) {
                newError.budget = 'Budget must be a whole number';
            }

            setError(newError);

            if (newError && Object.keys(newError).length > 0) {
                return;
            }

            if (budget === perviousBudget && description === previousDescription) {
                return;
            }

            await service.editProposal(id, description, budget);
            navigate('/phase1');

        } catch (err) {
            if (err?.response?.data?.type?.toUpperCase() === 'UNAUTHENTICATED' || err?.response?.data?.type?.toUpperCase() === 'UNAUTHORIZED') {
                secureLocalStorage.removeItem('loggedUser');
                navigate('/');
                return;
            }
            setRequestError(err?.response?.data?.message || "Something went wrong");
        }
    }


    return (

        <>
            {
                loggedUser &&
                <Container fluid>
                    <Row>
                        <Col className="d-flex justify-content-center mt-4 mb-4">
                            <h2>Edit Proposal</h2>
                        </Col>
                    </Row>

                    <div className="create-proposal-form">

                        <Row className="mb-2">
                            <Col>
                                {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible>
                                    <p>
                                        {requestError}
                                    </p>
                                </Alert>}
                            </Col>
                        </Row>

                        <Form onSubmit={save}>
                            <Row>
                                <Col className="">
                                    <Form.Group className="mb-3" controlId="formDescription">
                                        <Form.Label className="create-proposal-label">Description</Form.Label>
                                        <Form.Control as="textarea" rows={2} name='description' placeholder="Enter description" value={description} onChange={(e) => handleInputChange(e)} isInvalid={error?.description} />
                                        <Form.Control.Feedback type="invalid">
                                            {error.description}
                                        </Form.Control.Feedback>

                                    </Form.Group>
                                </Col>

                                <Col className="">
                                    <Form.Group className="mb-3" controlId="formBudget">
                                        <Form.Label className="create-proposal-label">Budget</Form.Label>
                                        <Form.Control type="number" name='budget' placeholder="Enter budget" value={budget} onChange={(e) => handleInputChange(e)} isInvalid={error?.budget} />
                                        <Form.Control.Feedback type="invalid">
                                            {error.budget}
                                        </Form.Control.Feedback>

                                    </Form.Group>
                                </Col>

                            </Row>
                            <Row>
                                <Col className='d-flex justify-content-center'>
                                    <Button variant="danger" type="button" className='me-3' onClick={() => { navigate('/') }} >
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        Save
                                    </Button>
                                </Col>
                            </Row>
                        </Form>

                    </div>


                </Container>
            }
        </>


    );
};


export default EditProposal;  