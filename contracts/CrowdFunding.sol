// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Token.sol";

contract Crowdfunding {
    struct Fundraiser {
        address creator;
        uint256 goal;
        uint256 deadline;
        uint256 raisedAmount;
        bool goalReached;
    }

    IERC20 public token; // ERC20 token contract
    Fundraiser[] public fundraisers;
    mapping(uint256 => mapping(address => uint256)) public donations; // Mapping to track donations

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function createFundraiser(uint256 _goal, uint256 _deadline) external {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        Fundraiser memory newFundraiser = Fundraiser({
            creator: msg.sender,
            goal: _goal,
            deadline: _deadline,
            raisedAmount: 0,
            goalReached: false
        });
        fundraisers.push(newFundraiser);
    }

    function donate(uint256 fundraiserId, uint256 amount) external {
        Fundraiser storage fundraiser = fundraisers[fundraiserId];
        require(fundraiser.deadline > block.timestamp, "Fundraiser deadline passed");
        require(fundraiser.goalReached == false, "Fundraiser goal reached");

        token.transferFrom(msg.sender, address(this), amount);
        donations[fundraiserId][msg.sender] += amount;
        fundraiser.raisedAmount += amount;

        if (fundraiser.raisedAmount >= fundraiser.goal) {
            fundraiser.goalReached = true;
        }
    }

    function withdraw(uint256 fundraiserId) external {
        Fundraiser storage fundraiser = fundraisers[fundraiserId];
        require(fundraiser.goalReached, "Fundraiser goal not reached");
        require(msg.sender == fundraiser.creator, "Only the creator can withdraw funds");

        token.transfer(msg.sender, fundraiser.raisedAmount);
    }
    
        function getTime()public view returns(uint){
            return block.timestamp;
        }
}
