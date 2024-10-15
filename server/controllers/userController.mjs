import UsersDto from "../dto/userDto.mjs";
import { CustomError } from '../utils/errorHandle.mjs';
import express from 'express';
import db from '../utils/db.mjs';

// import Logger from '../utils/logger.mjs';
// import Logger from '../utils/logger.mjs';

// const logger = new Logger('phaseController');

const userController = express.Router();
const userDto = new UsersDto(db);

userController.get('/', async (req, res, next) => {
    try {
        // let header = req.headers.authorization;
        // let payload = await authorization(header, [ROLES.ADMINISTRATOR]);
        let allUSers = await userDto.getAll();
        res.json(allUSers);
    } catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});

userController.get('/:id', async (req, res, next) => {
    try {
        // let header = req.headers.authorization;
        // let payload = await authorization(header, [ROLES.ADMIN]);

        let id = req.params.id;
        let usr = await userDto.getUserById(id);
        res.json(usr);
    } catch (error) {
        // logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});

userController.get('/name/:username', async (req, res, next) => {
    try {
        // let header = req.headers.authorization;
        // let payload = await authorization(header, [ROLES.ADMIN]);
        
        let username = req.params.username;
        let usr = await userDto.getUserByUsername(username);
        res.json(usr);
    } catch (error) {
        // logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});

export default userController;