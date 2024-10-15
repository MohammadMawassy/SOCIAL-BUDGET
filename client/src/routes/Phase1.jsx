import { Row, Col, Container, Alert, Table, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { PHASES } from '../utils/generals';
import ProposalService from '../services/proposalService';


const Phase1 = () => {

    const navigate = useNavigate();
    const loggedUser = secureLocalStorage.getItem('loggedUser');
    const [error, setError] = useState({});
    const [requestError, setRequestError] = useState(null);
    const [proposals, setProposals] = useState(null);
    const service = new ProposalService();
    const [totalBudget, setTotalBudget] = useState(0);
    const maxProposals = 3; 


    useEffect(() => {

        const checkPhase = async () => {
            try {
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
                // navigate('/404');
            }
        }


        const getTotalBudget = async () => {
            try {
                const data = await service.getBudget();
                setTotalBudget(data);
            } catch (err) {
                setRequestError(err.response?.data?.message || 'Something went wrong');
            }
        }


        const getProposals = async () => {
            try {
                const data = await service.getProposals();
                setProposals(data);
            } catch (err) {
                console.log(err);

                if (err.response?.data?.type === 'UNAUTHENTICATED' || err.response?.data?.type === 'UNAUTHORIZED') {
                    secureLocalStorage.removeItem('loggedUser');

                    return;
                }

                setRequestError(err.response?.data?.message || 'Something went wrong');
            }
        };

        checkPhase();
        getTotalBudget();
        getProposals();

    }, []);

    const ProposalTable = ({ data }) => {

        const handleEdit = (id) => {
            console.log('Edit:', id);
            navigate(`/edit_proposal/${id}`);   
        };

        const handleDelete = async (id) => {
            try {
                await service.deleteProposal(id);
                setProposals(proposals.filter(item => item.id !== id)); 
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
        }

        return (
            <Table striped bordered hover >
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Description</th>
                        <th>Budget</th>
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
                                <td>
                                    <div className='d-flex justify-content-center align-items-center'>
                                        <Button variant="warning" type="button" className='me-3' onClick={ () => handleEdit(item?.id)}><i className="bi bi-pencil-fill"></i></Button>
                                        <Button variant="danger" type="button" onClick={() => handleDelete(item?.id)} ><i className='bi bi-trash3-fill'></i></Button>
                                    </div>

                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        )
    };

    const onCreateAction = () => {

        if(proposals){
            let total = proposals.reduce((acc, item) => acc + item.budget, 0);
            if (total >= totalBudget) {
                setRequestError(`You can't add more proposals. The total budget is ${totalBudget} €`);
                return;
            }
        }

        if (proposals && proposals.length >= maxProposals) { 
            setRequestError(`You can't add more than ${maxProposals} proposals`);
            return;
        }

        navigate('/create_proposal');
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

    const onClosePhaseAction = async() => {
        try {
            await service.changePhase();
            navigate('/phase2');
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
    }

    return (
        <Container fluid>

            {secureLocalStorage.getItem('loggedUser') &&
                <div>
                    <Row className='mt-4'>
                        <Col className='ms-4 mb-4  d-flex justify-content-center'>
                            <h1>Phase 1</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='ms-4 mb-4  d-flex justify-content-start'>
                            <h2>Proposals</h2>
                        </Col>
                        <Col className='ms-4 mb-4 me-4 d-flex justify-content-end'>
                            <h3>Total Budget: {totalBudget} €</h3>
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

                    <Row>
                        <Col className='ms-4 mb-4  d-flex justify-content-end'>
                            <Button variant='success' onClick={onCreateAction}>Add <i className="bi bi-plus-circle-fill"></i></Button>
                        </Col>
                    </Row>

                    {secureLocalStorage.getItem('loggedUser') && secureLocalStorage.getItem('loggedUser')?.role === 'admin' &&
                        <Row>
                            <Col className='ms-4 mb-4  d-flex justify-content-center'>
                                <Button variant='danger' size='lg' type='button' className='me-5' onClick={onResetAction}>Reset</Button>
                                <Button variant='primary' size='lg' type='button' onClick={onClosePhaseAction}>Close Phase</Button>
                            </Col>
                        </Row>
                    }



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

export default Phase1;
