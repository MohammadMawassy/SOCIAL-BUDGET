`use strict`;
import VoteDto from './voteDto.mjs';

const ProposalDto = function (db) {

    this.tableName = 'Proposal';
    if (!db) {
        throw new Error('Database not found');
    }
    this.db = db;
    const voteDto = new VoteDto(db);


    this.getAll = async () => {
        return new Promise((resolve, reject) => {
            let proposals = [];
            this.db.all(`SELECT * FROM ${this.tableName}`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    for (let row of rows) {
                        let proposal = {
                            id: row?.id,
                            username: row?.username,
                            description: row?.description,
                            budget: row?.budget,
                        };
                        proposals.push(proposal);
                    }
                    resolve(proposals);
                }
            });
        });
    };

    this.getProposalById = async (id) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let proposal = {
                        id: row?.id,
                        username: row?.username,
                        description: row?.description,
                        budget: row?.budget,
                    };
                    resolve(proposal);
                }
            });
        });
    }

    this.getProposalsByUser = async (user) => {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName} WHERE username = ?`, [user.username], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    let proposals = [];
                    for (let row of rows) {
                        let proposal = {
                            id: row?.id,
                            username: row?.username,
                            description: row?.description,
                            budget: row?.budget
                        };
                        proposals.push(proposal);
                    }
                    resolve(proposals);
                }
            });
        });
    };

    this.getProposalByUserAndId = async (user, id) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE username = ? AND id = ?`, [user.username, id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let proposal = {
                        id: row?.id,
                        username: row?.username,
                        description: row?.description,
                        budget: row?.budget
                    };
                    resolve(proposal);
                }
            });
        });
    };

    this.addProposal = async (user, description, budget) => {
        const _this = this;
        return new Promise(async (resolve, reject) => {
            this.db.run(`INSERT INTO ${_this.tableName} (username, description, budget) VALUES (?, ?, ?)`, [user.username, description, budget], async function (err) {
                if (err) {
                    reject(err);
                } else {
                    let response = {
                        id: this.lastID,
                        username: user.username,
                        description: description,
                        budget: budget
                    };
                    resolve(response);
                }

            });
        });
    };

    this.updateProposal = async (proposalId, description, budget) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET description=?, budget=? WHERE id = ?`, [description, budget, proposalId], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    };

    this.deleteProposal = async (proposal_id) => {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [proposal_id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.getProposalWithTotalRate = async () => {
        let query = `select p.id, p.username, p.description, p.budget, SUM(COALESCE(v.rate, 0)) as totalRate from Proposal p left join Vote v on p.id = v.proposal_id group by p.id order by totalRate desc`;

        return new Promise((resolve, reject) => {
            this.db.all(query, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve(null);
                    }
                    let proposals = [];
                    for (let row of rows) {
                        let proposal = {
                            id: row?.id,
                            username: row?.username,
                            description: row?.description,
                            budget: row?.budget,
                            totalRate: row?.totalRate
                        };
                        proposals.push(proposal);
                    }
                    resolve(proposals);
                }
            });
        });
    };


    this.dropTable = async () => {
        return new Promise((resolve, reject) => {
            this.db.run(`DROP TABLE ${this.tableName}`, (err) => {
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
            this.db.run(`CREATE TABLE ${this.tableName} (
                    id INTEGER NOT NULL PRIMARY KEY,
                    description TEXT NOT NULL,
                    budget INTEGER NOT NULL,
                    username TEXT NOT NULL,
                    FOREIGN KEY (username) REFERENCES User(username));`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.getProposalForVoting = async (user) => {
        let query = `select p.id, p.username, p.description, p.budget, COALESCE(v.rate, 0) as rate from ${this.tableName} p left join (select * from Vote where user_id = ?) as v on p.id = v.proposal_id where p.username != ?`;

        return new Promise((resolve, reject) => {
            this.db.all(query, [user.id, user.username], async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve(null);
                    }
                    let proposals = [];
                    for (let row of rows) {
                        let proposal = {
                            id: row?.id,
                            username: row?.username,
                            description: row?.description,
                            budget: row?.budget,
                            rate: row?.rate || 0
                        };
                        proposals.push(proposal);
                    }
                    resolve(proposals);
                }
            });
        });
    };


};

export default ProposalDto;