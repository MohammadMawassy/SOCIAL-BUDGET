import axios from 'axios';

const base_url = 'http://localhost:3001';

const ProposalService = function () {

    this.login = async (username, password) => {
        try {
            const response = await axios.post(`${base_url}/login`, { username, password }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.logout = async () => {
        try {
            const response = await axios.get(`${base_url}/logout`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };


    this.checkAuth = async () => {
        try {
            const response = await axios.get(`${base_url}/auth`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

    this.getPhase = async () => {
        try {
            const response = await axios.get(`${base_url}/phase`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.getBudget = async () => {
        try {
            const response = await axios.get(`${base_url}/phase/budget`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.setBudget = async (budget) => {
        try {
            const response = await axios.put(`${base_url}/phase/budget/${budget}`, {}, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.changePhase = async () => {
        try {
            const response = await axios.put(`${base_url}/phase/change`, {}, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };


    this.resetPhase = async () => {
        try {
            const response = await axios.put(`${base_url}/phase/reset`, {}, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.getProposals = async () => {
        try {
            const response = await axios.get(`${base_url}/proposal`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };


    this.createProposal = async (description, budget) => {
        try {
            const response = await axios.post(`${base_url}/proposal`, { description, budget }, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.getProposal = async (proposalId) => {
        try {
            const response = await axios.get(`${base_url}/proposal/id/${proposalId}`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.editProposal = async (proposalId, description, budget) => {
        try {
            const response = await axios.put(`${base_url}/proposal/${proposalId}`, { description, budget }, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.deleteProposal = async (proposalId) => {
        try {
            const response = await axios.delete(`${base_url}/proposal/${proposalId}`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };


    this.getProposalsForVoting = async () => {
        try {
            const response = await axios.get(`${base_url}/proposal/vote`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.vote = async (proposalId, rate) => {
        try {
            const response = await axios.post(`${base_url}/vote/${proposalId}`, { rate }, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.revokeVote = async (proposalId) => {
        try {
            const response = await axios.put(`${base_url}/vote/${proposalId}/revoke`, {}, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };



    this.getApprovedProposals = async () => {  
        try {
            const response = await axios.get(`${base_url}/proposal/approved`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }   
    };


};


export default ProposalService;