// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Presale is Ownable, ReentrancyGuard {
    IERC20 public immutable shroudToken;
    uint256 public constant TOKEN_PRICE_PER_ETH = 10000;
    
    uint256 public immutable saleEndDate;
    bool public claimsEnabled = false;
    
    uint256 public totalEthRaised;
    mapping(address => uint256) public contributions;

    event Contribution(address indexed user, uint256 ethAmount, uint256 shroudAmount);
    event Claim(address indexed user, uint256 shroudAmount);

    constructor(address _shroudTokenAddress, uint256 _saleDurationDays, address initialOwner) Ownable(initialOwner) {
        shroudToken = IERC20(_shroudTokenAddress);
        saleEndDate = block.timestamp + (_saleDurationDays * 1 days);
    }

    function contribute() external payable nonReentrant {
        require(block.timestamp < saleEndDate, "Presale has ended");
        require(msg.value > 0, "Must send ETH");
        uint256 shroudToCredit = msg.value * TOKEN_PRICE_PER_ETH;
        contributions[msg.sender] += shroudToCredit;
        totalEthRaised += msg.value;
        emit Contribution(msg.sender, msg.value, shroudToCredit);
    }

    function enableClaims() external onlyOwner { claimsEnabled = true; }

    function withdrawEth() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "ETH withdrawal failed");
    }
    
    function claim() external nonReentrant {
        require(claimsEnabled, "Claims are not yet enabled");
        uint256 amountToClaim = contributions[msg.sender];
        require(amountToClaim > 0, "No contribution found");
        contributions[msg.sender] = 0;
        shroudToken.transfer(msg.sender, amountToClaim);
        emit Claim(msg.sender, amountToClaim);
    }
}