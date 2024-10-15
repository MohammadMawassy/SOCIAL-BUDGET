import { CustomError } from '../utils/errorHandle.mjs';
import express from 'express';
import  PhaseDto from '../dto/phaseDto.mjs';
import db from '../utils/db.mjs';
import { authorized } from '../utils/security.mjs';
import VoteDto from '../dto/voteDto.mjs';
import ProposalDto from '../dto/proposalDto.mjs'; 


const phaseController = express.Router();
const phaseDto = new PhaseDto(db);
const voteDto = new VoteDto(db);
const proposalDto = new ProposalDto(db);


phaseController.get('/', async (req, res, next) => {
    try {

        let activePhase = await phaseDto.getPhase();
        if(activePhase == null){
            throw new CustomError('Phase not found', 'PHASE_NOT_FOUND', 404);
        }

        res.json(activePhase);
    } catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});

phaseController.get('/budget', async (req, res, next) => {
    try {
        
        // let auth = authorized(req, ['admin', 'user']);   
        // if(!auth){
        //     throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        // }

        let budget = await phaseDto.getBudget();
        res.json(budget);
    } catch (error) {
        next(error);
    }
});

phaseController.put('/change', async (req, res, next) => {
    try {

        let auth = authorized(req, ['admin']);
        if(!auth){
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        let budget = await phaseDto.getBudget();
        let phase = await phaseDto.getPhase();
        let phaseNumber = phase.charAt(phase.length - 1);
        let newPhaseNumber = +phaseNumber + 1;

        if(phaseNumber == 3){
            throw new CustomError('Reset phase to phase0', 'RESET_PHASE', 400);
        }else{
            if(budget == 0 || budget == null){
                throw new CustomError('Cannot pass to the other phase without defining a budget', 'INVALID_BUDGET', 400);
            }
            else{
                let phaseName = 'phase' + newPhaseNumber;
                await phaseDto.changePhase(phaseName, 1);
                res.json(phaseName);
            }
        }
    } catch (error) {;
        next(error);
    }
});

phaseController.put('/budget/:budget', async (req, res, next) => {
    try {

        let auth = authorized(req, ['admin']); 
        if(!auth){
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        } 

        let activePhase = await phaseDto.getPhase();
        let budget = req.params.budget;
        if (activePhase.toLowerCase() == 'phase0'){
            await phaseDto.addBudget(budget);
            await phaseDto.changePhase('phase1', 1);
            res.json('phase1');
        }
        else{
            throw new CustomError('Can not change budget if phase name is not phase0', 400);
        }
    } catch (error) {

        next(error);
    }
});

phaseController.put('/reset', async (req, res, next) => {
    try {
    
        let auth = authorized(req, ['admin']);
        if(!auth){
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        await phaseDto.changePhase('phase0', 1);
        await phaseDto.addBudget(0);
        db.serialize(async() => {
            await voteDto.dropTable();    
            await proposalDto.dropTable();
            await proposalDto.createTable();
            await voteDto.createTable();

        });

        res.json(true);
    } catch (error) {
        next(error);
    }
});


export default phaseController;



