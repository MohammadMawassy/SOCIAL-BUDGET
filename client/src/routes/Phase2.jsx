import { Row, Col, Container, Alert, Table, Button, Modal, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { PHASES, wait } from '../utils/generals';
import ProposalService from '../services/proposalService';
import validator from 'validator';


const Phase2 = () => {

    const navigate = useNavigate();
    const loggedUser = secureLocalStorage.getItem('loggedUser');
    const [error, setError] = useState({});
    const [requestError, setRequestError] = useState(null);
    const [proposals, setProposals] = useState(null);
    const service = new ProposalService();
    const [totalBudget, setTotalBudget] = useState(0);
    const maxProposals = 3;
    const [showVote, setShowVote] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editRate, setEditRate] = useState(null);



    useEffect(() => {

        const checkPhase = async () => {
            try {
                const newPhase = await service.getPhase();  
                if (newPhase !== 'phase2') {
                    if (Object.values(PHASES).includes(newPhase.toLowerCase())) {
                        navigate(`/${newPhase.toLowerCase()}`);
                    }
                    else {
                        navigate('/404');
                    }
                }

            } catch (err) {
                console.log(err);
                // navigate('/404');
            }
        };

        const getProposals = async () => {
            try {
                if (secureLocalStorage.getItem('loggedUser')) {
                    const data = await service.getProposalsForVoting();
                    setProposals(data);
                }

            } catch (err) {
                console.log(err);
                if (err.response?.data?.type?.toUpperCase() === 'UNAUTHENTICATED' || err.response?.data?.type?.toUpperCase() === 'UNAUTHORIZED') {
                    secureLocalStorage.removeItem('loggedUser');
                    return;
                }
                setRequestError(err.response?.data?.message || 'Something went wrong');
            }
        }

        checkPhase();
        getProposals();

        return () => {
            setProposals(null);
            setTotalBudget(0);
            setRequestError(null);
            setError({});
            setEditId(null);
            setEditRate(null);
        };

    }, []);

    const ProposalTable = ({ data }) => {

        const handleEdit = (item) => {
            setShowVote(true);
            setEditId(item.id);
            setEditRate(item.rate);
        };

        const handleRevoke = async (item) => {
            try {
                await service.revokeVote(item.id);
                let newProposals = proposals.map(it => {
                    if (it.id === item.id) {
                        it.rate = 0;
                    }
                    return it;
                }
                );
                setProposals(newProposals);
            } catch (err) {
                console.log(err);
                if (err.response?.data?.type === 'UNAUTHENTICATED' || err.response?.data?.type === 'UNAUTHORIZED') {
                    secureLocalStorage.removeItem('loggedUser');
                    navigate('/');  
                    return;
                }
                setRequestError(err.response?.data?.message || 'Something went wrong');
            }
        }

        return (
            <Table striped bordered hover >
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Description</th>
                        <th>Budget</th>
                        <th>Rate</th>
                        <th className='d-flex justify-content-center'>Actions</th>
                    </tr>

                </thead>
                <tbody>
                    {(!data || data.length === 0) ? <tr><td colSpan='16' className='text-center fs-4'>No Proposals</td></tr> :
                        data.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item?.description}</td>
                                <td>{item?.budget}</td>
                                <td>{item?.rate === 0 ? '--' : item?.rate}</td>
                                <td>
                                    <div className='d-flex justify-content-center align-items-center'>
                                        <Button variant="warning" type="button" className='me-3' onClick={() => handleEdit(item)}><i className="bi bi-vector-pen"></i></Button>
                                        <Button variant="danger" type="button" onClick={() => handleRevoke(item)}><i className="bi bi-backspace"></i></Button>
                                    </div>

                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        )
    };


    const onResetAction = async() => {
        try {
            await service.resetPhase();
            navigate('/');
        }
        catch (err) {
            console.log(err);
            if (err.response?.data?.type === 'UNAUTHENTICATED' || err.response?.data?.type === 'UNAUTHORIZED') {
                secureLocalStorage.removeItem('loggedUser');
                navigate('/');
                return;
            }
            setRequestError(err.response?.data?.message || 'Something went wrong');
        }   
    };

    const onClosePhaseAction = async () => {
        try {
            let newPhase = await service.changePhase();
            navigate('/phase3');
        }
        catch (err) {
            console.log(err);
            if (err.response?.data?.type === 'UNAUTHENTICATED' || err.response?.data?.type === 'UNAUTHORIZED') {
                secureLocalStorage.removeItem('loggedUser');
                return;
            }
            setRequestError(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleCloseModal = () => {
        setShowVote(false);
        setEditId(null);
        setEditRate(null);
    };


    const handleRateEdit = (e) => {
        e.preventDefault();

        let val = e.target.value;

        setEditRate(val);
        setError({ ...error, rate: null });

    };

    const handleEditModal = async () => {

        if (!editRate || editRate === '') {
            setError({ rate: 'Rate is required' });
            return;
        }

        if (!validator.isInt(editRate.toString())) {
            setError({ rate: 'Rate must be a whole number' });
            return;
        }

        if (editRate < 1 || editRate > 3) {
            setError({ rate: 'Rate must be between 1 and 3' });
            return;
        }

        try {
            await service.vote(editId, editRate);
            handleCloseModal();
            let newProposals = proposals.map(item => {
                if (item.id === editId) {
                    item.rate = editRate;
                }
                return item;
            });

            setProposals(newProposals);

        } catch (err) {
            console.log(err);
            if (err.response?.data?.type === 'UNAUTHENTICATED' || err.response?.data?.type === 'UNAUTHORIZED') {
                secureLocalStorage.removeItem('loggedUser');
                return;
            }
            setRequestError(err.response?.data?.message || 'Something went wrong');
            setShowVote(false);
        }
    };

    return (
        <Container fluid>

            {secureLocalStorage.getItem('loggedUser') &&
                <div>
                    <Row className='mt-4'>
                        <Col className='ms-4 mb-4  d-flex justify-content-center'>
                            <h1>Phase 2</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='ms-4 mb-4  d-flex justify-content-start'>
                            <h2>Rate Proposals</h2>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>
                            {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible>
                                <p>
                                    {requestError}
                                </p>
                            </Alert>}
                        </Col>
                    </Row>
                    <ProposalTable data={proposals} />

                    {secureLocalStorage.getItem('loggedUser') && secureLocalStorage.getItem('loggedUser')?.role === 'admin' &&
                        <Row>
                            <Col className='ms-4 mb-4  d-flex justify-content-center'>
                                <Button variant='danger' size='lg' type='button' className='me-5' onClick={onResetAction}>Reset</Button>
                                <Button variant='primary' size='lg' type='button' onClick={onClosePhaseAction}>Close Phase</Button>
                            </Col>
                        </Row>
                    }


                    <Modal show={showVote} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>{`Set Rate`}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                            <Form.Group>
                                <Form.Control
                                    type="number"
                                    placeholder="Rate..."
                                    className="me-4"
                                    rows={1}
                                    value={editRate || ''}
                                    min={1}
                                    max={3}
                                    onChange={handleRateEdit} isInvalid={error?.rate} />
                                <Form.Control.Feedback type="invalid">
                                    {error?.rate}
                                </Form.Control.Feedback>
                            </Form.Group>


                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleEditModal}>
                                Edit
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
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

export default Phase2;
