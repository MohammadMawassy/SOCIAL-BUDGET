`use strict`;

const VoteDto = function (db) {

    this.tableName = 'Vote';
    if (!db) {
        throw new Error('Database not found');
    }
    this.db = db;

    this.getRate = async (proposal_id, user) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE proposal_id = ? AND user_id=?`, [proposal_id, user.id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let rate = row?.rate;
                    resolve(rate);
                }
            });
        });
    }

    this.getAllProposalsRate = async (user) => {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName} WHERE user_id=?`, [user.id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve(null);
                    }
                    let rateList = [];
                    for (let row of rows) {
                        let rate = {
                            proposal_id: row?.proposal_id,
                            user_id: row?.user_id,
                            rate: row?.rate
                        }
                        rateList.push(rate);
                    }
                    resolve(rateList);
                }
            });
        });
    }; 

    this.dropTable = async () => { 
        return new Promise((resolve, reject) => {
            this.db.run(`DROP TABLE IF EXISTS ${this.tableName}`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.createTable = async () => {
        return new Promise((resolve, reject) => {
            this.db.run(`CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                proposal_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rate INTEGER NOT NULL,
                FOREIGN KEY(proposal_id) REFERENCES Proposal(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE
            )`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    
    };

    this.addNewVote = async (proposal_id, user, rate) => {
        return new Promise((resolve, reject) => {
            const _this = this;
            this.db.run(`INSERT INTO ${_this.tableName} (proposal_id, user_id, rate) VALUES (?, ?, ?)`, [proposal_id, user.id, rate], function (err) {
                if (err) {
                    reject(err);
                } else {
                    let response = {
                        id: this.lastID,
                        proposal_id: proposal_id,
                        user_id: user.id,
                        rate: rate   
                    };
                    resolve(response);
                }
            });
        });
    }

    this.updateRate = async (proposal_id, user, rate) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET rate = ? WHERE proposal_id = ? AND user_id=?`, [rate, proposal_id, user.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    this.getTotalVotes = async (proposal_id) => {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName} WHERE proposal_id = ?`, [proposal_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve(null);
                    }
                    let sumOfVotes = 0;
                    for (let row of rows) {
                        sumOfVotes += row?.rate;
                    }
                    resolve(sumOfVotes);
                }
            });
        });
    }

    this.revokeRate = async (proposal_id, user) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET rate=0 WHERE proposal_id = ? AND user_id=?`, [proposal_id, user.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}

export default VoteDto;