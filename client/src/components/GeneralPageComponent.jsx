import { Container, Row, Col, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import ProposalService from "../services/proposalService";
import secureLocalStorage from 'react-secure-storage';


const GeneralPageComponent = () => {

    const service = new ProposalService();
    const navigate = useNavigate();

    useEffect(() => {

        const getPhase = async () => {
            try {
                const newPhase = await service.getPhase() ;

                if (newPhase === "phase0") {
                    navigate('/phase0');
                    return;
                }
                else if (newPhase === "phase1") {
                    navigate('/phase1');
                    return;

                }
                else if (newPhase === "phase2") {
                    navigate('/phase2');
                    
                    return;

                }
                else if (newPhase === "phase3") {
                    navigate('/phase3');
                    return;
                }

                else{
                    navigate('/404');
                }


            }
            catch (error) {
                console.log(error);
                navigate('/server_error');
            }
        };

        getPhase();

    }, []);

};

export default GeneralPageComponent;    