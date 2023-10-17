const { expect } = require("chai");

describe("Crowdfunding Contract", function () {
  let Crowdfunding;
  let crowdfunding;
  let Token;
  let token;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(1000000);
    await token.deployed();

    Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await Crowdfunding.deploy(token.address);
    await crowdfunding.deployed();
  });

  it("Should create a new fundraiser", async function () {
    await crowdfunding.createFundraiser(1000, Math.floor(Date.now() / 1000) + 3600);
    const fundraiser = await crowdfunding.fundraisers(0);
    expect(fundraiser.goal).to.equal(1000);
  });

  it("Should allow donations and withdrawal if goal is reached", async function () {
    await crowdfunding.createFundraiser(1000, Math.floor(Date.now() / 1000) + 3600);
    await token.approve(crowdfunding.address, 1000);
    await crowdfunding.donate(0, 1000);
    await crowdfunding.withdraw(0);

    const fundraiser = await crowdfunding.fundraisers(0);
    expect(fundraiser.raisedAmount).to.equal(1000);

    const contractBalance = await token.balanceOf(crowdfunding.address);
    expect(contractBalance).to.equal(0);
  });
  it("Should not allow creating a fundraiser with a past deadline", async function () {
    await expect(crowdfunding.createFundraiser(1000, Math.floor(Date.now() / 1000) - 3600)).to.be.revertedWith(
      "Deadline must be in the future"
    ); 
  });

  it("Should not allow withdrawing funds if the goal is not reached", async function () {
    await crowdfunding.createFundraiser(1000, Math.floor(Date.now() / 1000) + 3600);
    await token.approve(crowdfunding.address, 500);
    await crowdfunding.donate(0, 500);

    await expect(crowdfunding.withdraw(0)).to.be.revertedWith("Fundraiser goal not reached");
  });

  it("Should allow multiple fundraisers with different deadlines", async function () {
    await crowdfunding.createFundraiser(1000, Math.floor(Date.now() / 1000) + 3600);
    await crowdfunding.createFundraiser(2000, Math.floor(Date.now() / 1000) + 7200);

    const fundraiser1 = await crowdfunding.fundraisers(0);
    const fundraiser2 = await crowdfunding.fundraisers(1);

    expect(fundraiser1.goal).to.equal(1000);
    expect(fundraiser2.goal).to.equal(2000);
  });
});
// 