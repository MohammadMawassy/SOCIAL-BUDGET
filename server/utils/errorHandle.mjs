'use strict';


const errorHandle = async (err, req, res, next) => {
    try {


        if (!(err instanceof CustomError)) {
            console.error(err);
            err.message = 'Internal Server Error';
        }
        else {
            console.error(err.message);
        }   

        const error = {
            message: err.message || 'Internal Server Error',
            type: err.type || 'unknown'
        };
        res.status(err.status || 500).json(error);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

class CustomError extends Error {
    constructor(message, type, status) {
        super(message);
        this.type = type;
        this.status = status || 500;
    }
}

export { errorHandle, CustomError };
