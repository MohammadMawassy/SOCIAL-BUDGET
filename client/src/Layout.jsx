import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import secureLocalStorage from 'react-secure-storage';
import ProposalService from "./services/proposalService";
import { useState, useEffect } from "react";

const Layout = () => {


    const navigate = useNavigate();

    useEffect(() => {

        const checkAuth = async () => {
            try {
                const service = new ProposalService();
                await service.checkAuth();

            } catch (error) {
                console.log('Error:', error);
                secureLocalStorage.removeItem('loggedUser');
            }
        }

        // getPhase();
        checkAuth();

    }, []);



    const logoutHandler = async () => {
        console.log('logoutHandler');
        try {
            const service = new ProposalService();
            await service.logout();
            secureLocalStorage.removeItem('loggedUser');
            navigate('/');
        } catch (error) {
            console.log('Error:', error);
        }
    }

    const Headers = () => {

        return (

            <Navbar bg="primary" data-bs-theme="dark" expand="lg">
                <Container fluid>

                    <Nav className="me-auto nav-link-large">
                        <Nav.Link as={Link} to={'/'}  >Home</Nav.Link>
                    </Nav>

                    <Nav className="nav-link-large">
                        {secureLocalStorage.getItem('loggedUser')
                            ? <Nav.Link className="icon-size" onClick={logoutHandler}><i className="bi bi-box-arrow-right logout-icon-size"></i></Nav.Link>
                            : <Nav.Link as={Link} to={'/login'}>Login</Nav.Link>
                        }
                    </Nav>
                </Container>
            </Navbar>
        );
    };


    return (
        <div>
            <Headers />
            <Outlet />
        </div>
    );

};


export default Layout;  