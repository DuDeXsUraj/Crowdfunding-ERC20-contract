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

//   it("Should allow donor to refund if goal is not reached", async function () {
//     await crowdfunding.createFundraiser(1000, Math.floor(Date.now() / 1000) + 3600);
//     await token.connect(owner).approve(crowdfunding.address, 500);
//     await crowdfunding.connect(owner).donate(0, 500);
//     // await crowdfunding.connect(owner).refund(0);

//     const fundraiser = await crowdfunding.fundraisers(0);
//     expect(fundraiser.raisedAmount).to.equal(0);

//     const donorBalance = await token.balanceOf(owner.address);
//     expect(donorBalance).to.equal(1000000);
//   });
});
// 