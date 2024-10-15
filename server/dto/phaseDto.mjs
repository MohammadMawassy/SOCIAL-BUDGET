`use strict`;

const PhaseDto = function (db) {

    this.tableName = 'Phase';
    if (!db) {
        throw new Error('Database not found');
    }
    this.db = db;

    this.getPhase = async () => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName}`, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let phase = row?.phase_name;
                    resolve(phase);
                }
            });
        });
    };

    this.getBudget = async () => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName}`, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let budget = row?.budget;
                    resolve(budget);
                }
            });
        });
    }

    this.addBudget = async (budget) => {
        return new Promise((resolve, reject) => {
            let phase = 'phase0'
            this.db.run(`UPDATE ${this.tableName} SET budget=? WHERE phase_name = ?`, [budget, phase], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let budget = row?.budget;
                    resolve(budget);
                }
            });
        });
    }

    

    this.changePhase = async (phaseName, phaseId) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET phase_name = ? WHERE id = ?`, [phaseName, phaseId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}

export default PhaseDto;