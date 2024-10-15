`use strict`;

const db = require('../utils/db.mjs');
const  ProposalDto = require('./proposals');

const proposalDto = new ProposalDto(db);


addProposal =  async() => {  
    let data = await proposalDto.getAll();
    console.log(data);
};

addProposal();