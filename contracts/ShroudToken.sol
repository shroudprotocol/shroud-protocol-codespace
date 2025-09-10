// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ShroudToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Shroud Protocol", "SHROUD") Ownable(initialOwner) {}

    // The owner (the DAO or deployer) can mint new tokens up to a cap.
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}