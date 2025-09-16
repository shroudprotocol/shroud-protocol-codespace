// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Groth16Verifier.sol";

contract ShroudConductor {
    Groth16Verifier public immutable verifier;
    mapping(address => mapping(uint256 => bool)) public allowedDenominations;
    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => bool) public nullifiers;

    event Deposit(address indexed token, uint256 amount, bytes32 indexed commitment, uint256 leafIndex, bool isCustom);
    event Withdrawal(address indexed token, uint256 amount, address to, bytes32 nullifierHash);

    uint256 public nextLeafIndex;

    constructor(address _verifier, address[] memory _tokens, uint256[][] memory _denominations) {
        verifier = Groth16Verifier(_verifier);
        for (uint i = 0; i < _tokens.length; i++) {
            for (uint j = 0; j < _denominations[i].length; j++) {
                allowedDenominations[_tokens[i]][_denominations[i][j]] = true;
            }
        }
    }

    function deposit(address _token, uint256 _amount, bytes32 _commitment) external payable {
        require(_amount > 0, "Amount cannot be zero");
        require(!commitments[_commitment], "Commitment already exists");

        bool isStandardDenomination = allowedDenominations[_token][_amount];

        if (_token == address(0)) {
            require(msg.value == _amount, "Invalid ETH amount");
        } else {
            require(msg.value == 0, "ETH sent with ERC20 deposit");
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }

        commitments[_commitment] = true;
        emit Deposit(_token, _amount, _commitment, nextLeafIndex, !isStandardDenomination);
        nextLeafIndex++;
    }

    function withdraw(
        uint256[2] calldata _a,
        uint256[2][2] calldata _b,
        uint256[2] calldata _c,
        uint256[5] calldata _publicSignals,
        address _token,
        uint256 _amount
    ) external {
        bytes32 nullifierHash = bytes32(_publicSignals[1]);
        address recipient = address(uint160(uint256(_publicSignals[2])));

        require(!nullifiers[nullifierHash], "Nullifier has been spent");

        uint[2] memory pA = [_a[0], _a[1]];
        uint[2][2] memory pB = [[_b[0][0], _b[0][1]], [_b[1][0], _b[1][1]]];
        uint[2] memory pC = [_c[0], _c[1]];
        
        require(verifier.verifyProof(pA, pB, pC, _publicSignals), "Invalid ZK proof");
        
        nullifiers[nullifierHash] = true;
        
        if (_token == address(0)) {
            payable(recipient).transfer(_amount);
        } else {
            IERC20(_token).transfer(recipient, _amount);
        }

        emit Withdrawal(_token, _amount, recipient, nullifierHash);
    }
}
