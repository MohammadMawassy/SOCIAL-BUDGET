import { Row, Col, Container, Alert, Table, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { PHASES } from '../utils/generals';
import ProposalService from '../services/proposalService';


const Phase3 = () => {

    const navigate = useNavigate();
    const [loggedUser, setLoggedUser] = useState(null);
    const [error, setError] = useState({});
    const [requestError, setRequestError] = useState(null);
    const [proposals, setProposals] = useState(null);
    const service = new ProposalService();
    const [totalBudget, setTotalBudget] = useState(0);
    const maxProposals = 3;


    useEffect(() => {

        setLoggedUser(secureLocalStorage.getItem('loggedUser'));

        const checkPhase = async () => {
            try {
                const newPhase = await service.getPhase();  
                if (newPhase !== 'phase3') {
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
        };

        const getTotalBudget = async () => {
            try {
                const data = await service.getBudget();
                setTotalBudget(data);
            } catch (err) {
                // console.log(err);
                // if (err.response?.data?.type?.toUpperCase() === 'UNAUTHENTICATED' || err.response?.data?.type?.toUpperCase() === 'UNAUTHORIZED') {
                //     secureLocalStorage.removeItem('loggedUser');
                //     return;
                // }
                setRequestError(err.response?.data?.message || 'Something went wrong');
            }
        }

        const getProposals = async () => {
            try {
                const data = await service.getApprovedProposals();
                setProposals(data);
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
        getTotalBudget();
        getProposals();

        return () => {
            setProposals(null);
            setRequestError(null);
            setLoggedUser(null);
        }


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
                        <th>Proposed By</th>
                        <th>Total Rate</th>
                    </tr>

                </thead>
                <tbody>
                    {(!data || data.length === 0) ? <tr><td colSpan='16' className='text-center fs-4'>No Proposals</td></tr> :
                        data.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item?.description}</td>
                                <td>{item?.budget}</td>
                                <td>{item?.approved ? item?.username : '-----'}</td>
                                <td>{item?.totalRate}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        )
    };

    const onCreateAction = () => {

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

    const onClosePhaseAction = async () => {
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


            <div>
                <Row className='mt-4'>
                    <Col className='ms-4 mb-4  d-flex justify-content-center'>
                        <h1>Phase 3</h1>
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

                {loggedUser && loggedUser?.role === 'admin' &&
                    <Row>
                        <Col className='ms-4 mb-4  d-flex justify-content-center'>
                            <Button variant='danger' size='lg' type='button' className='me-5' onClick={onResetAction}>Reset</Button>
                        </Col>
                    </Row>
                }


            </div>

        </Container>

    )
};

export default Phase3;
