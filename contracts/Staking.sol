// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is Ownable, ReentrancyGuard {
    IERC20 public immutable shroudToken;
    IERC20 public immutable rewardToken; // e.g., USDC or WETH

    mapping(address => uint256) public stakedBalance;
    uint256 public totalStaked;
    mapping(address => uint256) public rewards; // Simplified rewards mapping

    constructor(address _shroudTokenAddress, address _rewardTokenAddress, address initialOwner) Ownable(initialOwner) {
        shroudToken = IERC20(_shroudTokenAddress);
        rewardToken = IERC20(_rewardTokenAddress);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        totalStaked += _amount;
        stakedBalance[msg.sender] += _amount;
        shroudToken.transferFrom(msg.sender, address(this), _amount);
    }

    function unstake(uint256 _amount) external nonReentrant {
        require(stakedBalance[msg.sender] >= _amount, "Insufficient balance");
        totalStaked -= _amount;
        stakedBalance[msg.sender] -= _amount;
        shroudToken.transfer(msg.sender, _amount);
    }

    function addRewards(uint256 _amount) external {
        rewardToken.transferFrom(msg.sender, address(this), _amount);
    }
    
    function claimRewards() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        rewards[msg.sender] = 0;
        rewardToken.transfer(msg.sender, reward);
    }
}