import { expect } from "chai";
import { network } from "hardhat";
import { PANIC_CODES } from "@nomicfoundation/hardhat-ethers-chai-matchers/panic";

const { ethers, networkHelpers } = await network.create();

async function initRegisteringVoters() {
  const voting = await ethers.deployContract("Voting");
  const [owner, voter1, voter2, voter3] = await ethers.getSigners();
  
  return { voting, owner, voter1, voter2, voter3 };
}

async function initProposalsRegistrationStarted() {
  const { voting, owner, voter1, voter2, voter3 } = await networkHelpers.loadFixture(initRegisteringVoters);
  await voting.addVoter(voter1.address);
  await voting.addVoter(voter2.address);
  await voting.addVoter(voter3.address);
  await voting.startProposalsRegistering();
  return { voting, owner, voter1, voter2, voter3 };
}

describe("Voting contract", function () {
    describe("Deployment", function () {
        it("sets the deployer as owner", async function () {
            const { voting, owner } = await networkHelpers.loadFixture(initRegisteringVoters);

            // Ownable(msg.sender) in the constructor
            expect(await voting.owner()).to.equal(owner.address);
        });

        it("starts in RegisteringVoters status", async function () {
            const { voting } = await networkHelpers.loadFixture(initRegisteringVoters);

            expect(await voting.workflowStatus()).to.equal(0n);
            expect(await voting.winningProposalID()).to.equal(0n);
        });
    });

    describe("RegisteringVoters status", function () {
        type Fixture = Awaited<ReturnType<typeof initRegisteringVoters>>;
        let voting: Fixture["voting"];
        let voter1: Fixture["voter1"];
        let voter2: Fixture["voter2"];

        beforeEach(async () => {
            ({ voting, voter1, voter2 } = await networkHelpers.loadFixture(initRegisteringVoters));
        });

        it("allows only addVoter and startProposalsRegistering", async function () {
            // Add voter1
            await voting.addVoter(voter1.address);

            // All functions (except addVoter, startProposalsRegistering)
            // could not be called in RegisteringVoters status
            await expect(voting.connect(voter1).addProposal("proposal")).to.be.revertedWith(
                "Proposals are not allowed yet",
            );
            await expect(voting.connect(voter1).setVote(0)).to.be.revertedWith(
                "Voting session havent started yet",
            );
            await expect(voting.endProposalsRegistering()).to.be.revertedWith(
                "Registering proposals havent started yet",
            );
            await expect(voting.startVotingSession()).to.be.revertedWith(
                "Registering proposals phase is not finished",
            );
            await expect(voting.endVotingSession()).to.be.revertedWith(
                "Voting session havent started yet",
            );
            await expect(voting.tallyVotes()).to.be.revertedWith(
                "Current status is not voting session ended",
            );

            // startProposalsRegistering is allowed, so assert it last: it changes the status
            await voting.startProposalsRegistering();
        });

        describe("addVoter", function () {
            it("rejects an already registered voter", async function () {
                await voting.addVoter(voter1.address);
                await expect(voting.addVoter(voter1.address)).to.be.revertedWith(
                    "Already registered"
                );
            });

            it("stores the new voter's default state", async function () {
                await voting.addVoter(voter1.address);

                // getVoter is onlyVoters, so read it from voter1 itself
                const registered = await voting.connect(voter1).getVoter(voter1.address);
                expect(registered.isRegistered).to.be.true;
                expect(registered.hasVoted).to.be.false;
                expect(registered.votedProposalId).to.equal(0n);

                // an address that was never registered keeps the zero-value struct
                const unknown = await voting.connect(voter1).getVoter(voter2.address);
                expect(unknown.isRegistered).to.be.false;
            });

            it("emits VoterRegistered with the voter address", async function () {
                await expect(voting.addVoter(voter1.address))
                    .to.emit(voting, "VoterRegistered")
                    .withArgs(voter1.address);

                // each registration emits its own event, with its own address
                await expect(voting.addVoter(voter2.address))
                    .to.emit(voting, "VoterRegistered")
                    .withArgs(voter2.address);
            });

            it("rejects a non-owner caller", async function () {
                // Ownable reverts with a custom error carrying the caller address
                await expect(voting.connect(voter1).addVoter(voter2.address))
                    .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
                    .withArgs(voter1.address);
            });

            // Documents current behaviour, not desired behaviour: addVoter has no
            // zero-address check, so address(0) becomes a registered voter that
            // nobody can ever vote from.
            it("accepts the zero address", async function () {
                await voting.addVoter(ethers.ZeroAddress);

                await voting.addVoter(voter1.address);
                const registered = await voting.connect(voter1).getVoter(ethers.ZeroAddress);
                expect(registered.isRegistered).to.be.true;
                expect(registered.hasVoted).to.be.false;
                expect(registered.votedProposalId).to.equal(0n);
            });
        });

        describe("startProposalsRegistering", function () {
            it("changes status and creates GENESIS proposal", async function () {
                // getOneProposal is onlyVoters, so we need a registered reader
                await voting.addVoter(voter1.address);

                // before: still RegisteringVoters, and no proposal at all
                expect(await voting.workflowStatus()).to.equal(0n);
                await expect(voting.connect(voter1).getOneProposal(0)).to.be.revertedWithPanic(
                    PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS
                );

                await voting.startProposalsRegistering();

                // after: ProposalsRegistrationStarted, with GENESIS as proposal 0
                expect(await voting.workflowStatus()).to.equal(1n);
                const genesis = await voting.connect(voter1).getOneProposal(0);
                expect(genesis.description).to.equal("GENESIS");
                expect(genesis.voteCount).to.equal(0n);

                // GENESIS is the only proposal created
                await expect(voting.connect(voter1).getOneProposal(1)).to.be.revertedWithPanic(
                    PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS
                );
            });

            it("emits WorkflowStatusChange with both statuses", async function () {
                // RegisteringVoters (0) -> ProposalsRegistrationStarted (1)
                await expect(voting.startProposalsRegistering())
                    .to.emit(voting, "WorkflowStatusChange")
                    .withArgs(0n, 1n);
            });

            it("rejects a non-owner caller", async function () {
                // Ownable reverts with a custom error carrying the caller address
                await expect(voting.connect(voter1).startProposalsRegistering())
                    .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
                    .withArgs(voter1.address);
            });
        });
    });

    describe("ProposalsRegistrationStarted status", function () {
    });

    describe("ProposalsRegistrationEnded status", function () {
    });

    describe("VotingSessionStarted status", function () {
    });

    describe("VotingSessionEnded status", function () {
    });

    describe("VotesTallied status", function () {
    });

    describe("Getters", function () {

    });

    describe("Ownable inherited functions", function () {

    });
});