
const PHASES = {
    PHASE0 : 'phase0',  
    PHASE1 : 'phase1', 
    PHASE2 : 'phase2',
    PHASE3 : 'phase3'   
}


const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));   


export { PHASES, wait }   