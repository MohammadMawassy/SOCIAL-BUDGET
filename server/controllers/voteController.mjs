import { CustomError } from '../utils/errorHandle.mjs';
import express from 'express';
import db from '../utils/db.mjs';
import VoteDto from '../dto/voteDto.mjs';
import ProposalDto from '../dto/proposalDto.mjs';
import UserDto from '../dto/userDto.mjs';
import PhaseDto from '../dto/phaseDto.mjs';
import { authorized } from '../utils/security.mjs';

const voteController = express.Router();
const voteDto = new VoteDto(db);
const proposalDto = new ProposalDto(db);
const userDto = new UserDto(db);
const phaseDto = new PhaseDto(db);

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
}

// const checkPhaseFinal = async (req, res, next) => {
//     try {
//         let phase = await phaseDto.getPhase();
//         if (phase == null) {
//             throw new CustomError('Phase not found', 'PHASE_NOT_FOUND', 404);
//         }
//         if (phase == 'phase3') {
//             next();
//         }
//         else {
//             throw new CustomError('You can only do this in phase3', 'PHASE_NOT_ALLOWED', 400);
//         }
//     } catch (error) {
//         next(error);
//     }
// }


voteController.get('/:proposalId', checkPhase2, async (req, res, next) => {
    try {
        // let header = req.headers.authorization;
        // let payload = await authorization(header, [ROLES.ADMIN]);

        let user = await userDto.getUserByUsername('user');
        let proposalId = Number(req.params.proposalId);

        let rateValue = await voteDto.getRate(proposalId, user);
        res.json(rateValue);
    } catch (error) {
        next(error);
    }
});


voteController.post('/:proposalId', checkPhase2, async (req, res, next) => {
    try {

        let auth = authorized(req, ['admin', 'user']);

        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        let user = req.user;

        let proposalId = Number(req.params?.proposalId);
        let rate = Number(req.body?.rate);


        if (rate == null) {
            throw new CustomError('Rate is required', 'INVALID_INPUT', 400);
        }

        if (rate < 1 || rate > 3) {
            throw new CustomError('Rate must be between 1 and 3', 'INVALID_INPUT', 400);
        }

        let proposals = await proposalDto.getProposalsByUser(user);
        let proposalsIdList = proposals.map(proposal => proposal.id);
        let bool = false;
        for (let id of proposalsIdList) {
            if (id == proposalId) {
                bool = true;
            }
        }
        let proposalVoted = await voteDto.getRate(proposalId, user);

        if (proposalVoted == null) {
            if (!bool) {
                await voteDto.addNewVote(proposalId, user, rate);
                res.json(true);
            }
            else {
                throw new CustomError('You can not vote for your own proposals', 'INVALID_REQUEST', 400);
            }
        } else {
            await voteDto.updateRate(proposalId, user, rate);
            res.json(true);
        }

    } catch (error) {
        next(error);
    }
});




voteController.put('/:proposalId/revoke', checkPhase2, async (req, res, next) => {
    try {
        
        let auth = authorized(req, ['admin', 'user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        let user = req.user;

        if (user != null) {
            let proposalId = req.params.proposalId;

            await voteDto.updateRate(proposalId, user, 0);
            res.json(true);

        } else {
            throw new CustomError('User does not exist', 'NOT_FOUND', 400);
        }
    } catch (error) {
        next(error);
    }
});


export default voteController;