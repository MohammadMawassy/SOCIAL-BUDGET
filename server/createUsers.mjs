import db from "./utils/db.mjs";
import {generateRandom, generateHash} from "./utils/security.mjs";    
import UserDto from "./dto/userDto.mjs";    

const user1 = {
    username: 'user1',
    password: 'user1234',
    salt:  generateRandom(64), 
    role : 'user'
}; 

const user2 = {
    username: 'user2',
    password: 'user1234',
    salt:  generateRandom(64),
    role : 'user'
}; 

const user3 = {
    username: 'user3',
    password: 'user1234',
    salt:  generateRandom(64), 
    role : 'user'
};

const user4 = {
    username: 'user4',
    password: 'user1234',
    salt:  generateRandom(64),
    role: 'user'    
};

const admin = {
    username: 'admin',
    password: 'admin1234',
    salt:  generateRandom(64),
    role: 'admin'
};

let users = [user1, user2, user3, user4, admin];    

for (let user of users) {  
    user.password = generateHash(user.password, user.salt);
    const userDto = new UserDto(db);
    userDto.CreateUser(user).then((result) => {
        console.log(`User ${user.username} created`);
    }).catch((err) => {
        console.error(err);
    });
}