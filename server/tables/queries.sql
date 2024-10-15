
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Proposal;
DROP TABLE IF EXISTS Vote;
DROP TABLE IF EXISTS Phase;
DROP TABLE IF EXISTS Login;

PRAGMA foreign_keys = ON;


-- Create User table with id and unique username
CREATE TABLE User
(
    id INTEGER NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL
);

-- Create Proposal table with foreign key referencing User(username)
CREATE TABLE Proposal
(
    id INTEGER NOT NULL PRIMARY KEY,
    description TEXT NOT NULL,
    budget INTEGER NOT NULL,
    username TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES User(username)
);

-- Create Vote table with foreign key referencing Proposal(Proposal_id) and User(id)
CREATE TABLE Vote
(
    id INTEGER NOT NULL PRIMARY KEY,
    proposal_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rate INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (proposal_id) REFERENCES Proposal(id)
);

-- Create Phase table
CREATE TABLE Phase
(
    id INTEGER NOT NULL PRIMARY KEY,
    phase_name TEXT NOT NULL,
    budget INTEGER
);



INSERT INTO Phase (phase_name, budget) VALUES ('phase0', 0);    


-- INSERT INTO USER (username, password, salt, role) VALUES ('user1', 'user1', 'user1', 'user1');
-- INSERT INTO PROPOSAL (description, budget, is_approved, username) VALUES ('Proposal 1', '1000', 0, 'admin');
-- INSERT INTO PHASE (phase_name, budget) VALUES ('Phase 1', 1000);
-- UPDATE PHASE SET phase_name = 'phase3' WHERE id = 1;