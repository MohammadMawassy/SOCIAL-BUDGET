import { CustomError } from '../utils/errorHandle.mjs';
import express from 'express';
import db from '../utils/db.mjs';
import ProposalDto from '../dto/proposalDto.mjs';
import UsersDto from '../dto/userDto.mjs';
import PhaseDto from '../dto/phaseDto.mjs';
import { authorized } from '../utils/security.mjs';


const proposalController = express.Router();
const proposalDto = new ProposalDto(db);
const userDto = new UsersDto(db);
const phaseDto = new PhaseDto(db);

const checkPhase = async (req, res, next) => {
    try {
        let phase = await phaseDto.getPhase();
        if (phase == null) {
            throw new CustomError('Phase not found', 'PHASE_NOT_FOUND', 404);
        }
        if (phase == 'phase1') {
            next();
        }
        else {
            throw new CustomError('You can only do this in phase1', 'PHASE_NOT_ALLOWED', 400);
        }
    } catch (error) {
        next(error);
    }
}

const checkPhase2 = async (req, res, next) => { 
    try {
        let phase = await phaseDto.getPhase();
        if (phase == null) {
            throw new CustomError('Phase not found', 'PHASE_NOT_FOUND', 404);
        }
        if (phase == 'phase2') {
            next();
        }
        else {
            throw new CustomError('You can only do this in phase2', 'PHASE_NOT_ALLOWED', 400);
        }
    } catch (error) {
        next(error);
    }
};


const checkPhaseFinal = async (req, res, next) => {
    try {
        let phase = await phaseDto.getPhase();
        if (phase == null) {
            throw new CustomError('Phase not found', 'PHASE_NOT_FOUND', 404);
        }
        if (phase == 'phase3') {
            next();
        }
        else {
            throw new CustomError('You can only do this in phase3', 'PHASE_NOT_ALLOWED', 400);
        }
    } catch (error) {
        next(error);
    }
}

proposalController.get('/', checkPhase, async (req, res, next) => {
    try {

        let auth = authorized(req, ['admin', 'user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        let user = req.user;

        let proposals = await proposalDto.getProposalsByUser(user);
        res.json(proposals);
    } catch (error) {
        next(error);
    }
});

proposalController.get('/id/:id', async (req, res, next) => {
    try {

        let auth = authorized(req, ['admin', 'user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        let id = Number(req.params?.id);
        let user = req.user;
        let proposal = await proposalDto.getProposalByUserAndId(user, id);
        if (!proposal) {
            throw new CustomError('Proposal not found', 'PROPOSAL_NOT_FOUND', 404);
        }
        res.json(proposal);
    } catch (error) {
        next(error);
    }
});


//Add a new proposal
proposalController.post('/', checkPhase, async (req, res, next) => {
    try {

        let auth = authorized(req, ['admin', 'user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }
        let user = req.user;

        let proposalList = await proposalDto.getProposalsByUser(user);

        let definedBudget = await phaseDto.getBudget();
        if (proposalList.length >= 3) {
            throw new CustomError('You can only have 3 proposals', 'INVALID_REQUEST', 400);
        }
        else {
            let description = req.body?.description;

            if (description == null || description == '') {
                throw new CustomError('Description is required', 'INVALID_REQUEST', 400);
            }

            let budget = Number(req.body?.budget);

            if (!budget || budget == 0 || budget < 0) {
                throw new CustomError('Invalid Budget', 'INVALID_REQUEST', 400);
            }

            if (budget > definedBudget) {
                throw new CustomError(`Budget is higher than defined. Budget can't be higher than ${definedBudget - totalBudget}`, 'INVALID_REQUEST', 400);
            } else {
                let proposal = await proposalDto.addProposal(user, description, budget);
                res.json(proposal);
            }
        }
    } catch (error) {
        next(error);
    }
});

proposalController.put('/:id', checkPhase, async (req, res, next) => {
    try {

        let auth = authorized(req, ['admin', 'user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }
        let user = req.user;
        let proposalId = Number(req.params?.id);

        let proposal = await proposalDto.getProposalByUserAndId(user, proposalId);
        if (proposal == null) {
            throw new CustomError('Proposal not found', 'PROPOSAL_NOT_FOUND', 404);
        }
        let description = req.body?.description;
        let budget = Number(req.body?.budget);

        if (!description || description == '') {
            throw new CustomError('Description is required', 'INVALID_REQUEST', 400);
        }


        if (budget == null || budget == 0 || budget < 0) {
            throw new CustomError('Invalid Budget', 'INVALID_REQUEST', 400);
        }

        let definedBudget = await phaseDto.getBudget();
        let totalBudget = 0;
        let proposals = await proposalDto.getProposalsByUser(user);
        for (let proposal of proposals) {
            if (proposal.id != proposalId) {
                totalBudget += proposal.budget;
            }
        }

        if (budget > definedBudget - totalBudget) {
            throw new CustomError(`Budget is higher than defined. Budget can't be higher than ${definedBudget - totalBudget}`, 'INVALID_REQUEST', 400);
        }

        await proposalDto.updateProposal(proposalId, description, budget);

        res.json(true);



    } catch (error) {
        next(error);
    }
});



proposalController.get('/approved', checkPhaseFinal, async (req, res, next) => {
    try {
        let auth =  false;
        try {
            auth = authorized(req, ['admin', 'user']);
        } catch (error) {
            auth = false;
        }

        let proposals = await proposalDto.getProposalWithTotalRate();
        let budget = await phaseDto.getBudget();   
        
        let approved = [];
        let unapproved = [];

        for(let proposal of proposals){ 
            if(proposal.budget <= budget){
                proposal.approved = true;
                budget -= proposal.budget;  
                approved.push(proposal);    
            }
            else{
                proposal.approved = false;
                proposal.username =  undefined;
                unapproved.push(proposal);  
            }      
        }

        let response = approved.concat(unapproved);    

        if(!auth){
            res.json(approved);
            return;
        }

        res.json(response);
    } catch (error) {
        next(error);
    }
});

proposalController.delete('/:id', checkPhase, async (req, res, next) => {
    try {
        let auth = authorized(req, ['admin', 'user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }
        let user = req.user;

        let proposalId = Number(req.params?.id);

        let proposals = await proposalDto.getProposalByUserAndId(user, proposalId);

        if (!proposals) {
            throw new CustomError('Proposal not found', 'PROPOSAL_NOT_FOUND', 404);
        }

        await proposalDto.deleteProposal(proposalId);

        res.json(true);

    } catch (error) {
        next(error);
    }
});


proposalController.get('/vote', checkPhase2, async (req, res, next) => { //get all proposals for voting

    try {
        let auth = authorized(req, ['admin', 'user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        let user = req.user;

        let proposals = await proposalDto.getProposalForVoting(user);
        res.json(proposals);    

    } catch (error) {
        next(error);
    }
});


export default proposalController;