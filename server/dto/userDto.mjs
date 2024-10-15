`use strict`;

const UsersDto = function (db) {

    this.tableName = 'User';
    if (!db) {
        throw new Error('Database not found');
    }
    this.db = db;

    this.getAll = async () => {
        return new Promise((resolve, reject) => {
            let users = [];
            this.db.all(`SELECT * FROM ${this.tableName}`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    for (let row of rows) {
                        let user = {
                            id: row?.id,
                            username: row?.username,
                            role: row?.role,    
                        };
                        users.push(user);
                        resolve(users);
                    }
                }
            });
        });
    };

    this.CreateUser = async (user) => {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO ${this.tableName} (username, password, salt, role) VALUES (?, ?, ?, ?)`, [user.username, user.password, user.salt, user.role], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        }); 
    };

    this.getUserById = async (id) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let user = {
                        id: row?.id,
                        username: row?.username,
                        role: row?.role,
                    };
                    resolve(user);
                }
            });
        });
    }

    this.getUserByUsername = async (username) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE username = ?`, [username], function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let user = {
                        id: row?.id,
                        username: row?.username,
                        password : row?.password,
                        salt: row?.salt,
                        role: row?.role   
                    };
                    resolve(user);
                }
            });
        });
    };  
};

export default UsersDto;