// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;
import "@openzeppelin/contracts/access/Ownable.sol";


contract Voting is Ownable {
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint240 votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    // uint248 pour que winningProposalID et workflowStatus partagent un slot
    uint248 public winningProposalID;
    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;


    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    error NotAVoter();
    error WrongStatus(WorkflowStatus expected, WorkflowStatus current);
    error AlreadyRegistered();
    error EmptyProposal();
    error AlreadyVoted();
    error ProposalNotFound();

    constructor() Ownable(msg.sender) {    }
    
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, NotAVoter());
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, WrongStatus(WorkflowStatus.RegisteringVoters, workflowStatus));
        require(!voters[_addr].isRegistered, AlreadyRegistered());
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, WrongStatus(WorkflowStatus.ProposalsRegistrationStarted, workflowStatus));
        require(bytes(_desc).length > 0, EmptyProposal());
        // voir que desc est different des autres

        proposalsArray.push(Proposal(_desc,0));
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, WrongStatus(WorkflowStatus.VotingSessionStarted, workflowStatus));
        require(!voters[msg.sender].hasVoted, AlreadyVoted());
        require(_id < proposalsArray.length, ProposalNotFound());

        voters[msg.sender].votedProposalId = uint240(_id);
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        // mise à jour du gagnant après chaque vote : évite une boucle for
        // lors du décompte, et donc un possible DoS
        uint winningCount = proposalsArray[winningProposalID].voteCount;
        uint newCount = proposalsArray[_id].voteCount;

        // BLANK VOTE (index 0) est le vote blanc : à égalité, une vraie
        // proposition passe devant lui
        if (newCount > winningCount || (newCount == winningCount && winningProposalID == 0 && _id != 0)) {
            winningProposalID = uint248(_id);
        }

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //


    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, WrongStatus(WorkflowStatus.RegisteringVoters, workflowStatus));
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        proposalsArray.push(Proposal("BLANK VOTE", 0));
        emit ProposalRegistered(proposalsArray.length-1);
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, WrongStatus(WorkflowStatus.ProposalsRegistrationStarted, workflowStatus));
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, WrongStatus(WorkflowStatus.ProposalsRegistrationEnded, workflowStatus));
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, WrongStatus(WorkflowStatus.VotingSessionStarted, workflowStatus));
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }


   function tallyVotes() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, WrongStatus(WorkflowStatus.VotingSessionEnded, workflowStatus));

       // winningProposalID est déjà à jour, maintenu par setVote
       workflowStatus = WorkflowStatus.VotesTallied;
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}