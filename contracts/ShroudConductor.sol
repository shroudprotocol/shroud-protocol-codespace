// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// This is the interface for the snarkjs generated verifier.
// The name `Groth16Verifier` must match the contract name inside the generated verifier file.
// We create an interface for it to allow our main contract to call it.
interface IGroth16Verifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input // Corresponds to the public signals from the circuit
    ) external view returns (bool);
}

contract ShroudConductor {
    // --- STATE VARIABLES ---
    IGroth16Verifier public immutable verifier; // Use the correct interface
    // Mapping: tokenAddress => amount => isAllowed
    mapping(address => mapping(uint256 => bool)) public allowedDenominations;
    // Mapping: commitmentHash => hasBeenDeposited
    mapping(bytes32 => bool) public commitments;
    // Mapping: nullifierHash => hasBeenSpent
    mapping(bytes32 => bool) public nullifiers;

    // --- EVENTS ---
    event Deposit(address indexed token, uint256 amount, bytes32 indexed commitment, uint256 timestamp, bool isCustom);
    event Withdrawal(address indexed token, uint256 amount, address to, bytes32 nullifierHash, bool isCustom);

    // --- CONSTRUCTOR ---
    constructor(address _verifier, address[] memory _tokens, uint256[][] memory _denominations) {
        verifier = IGroth16Verifier(_verifier); // Cast the address to our verifier interface
        for (uint i = 0; i < _tokens.length; i++) {
            for (uint j = 0; j < _denominations[i].length; j++) {
                allowedDenominations[_tokens[i]][_denominations[i][j]] = true;
            }
        }
    }

    // --- STANDARD DEPOSIT ---
    function deposit(address _token, uint256 _amount, bytes32 _commitment) external payable {
        require(allowedDenominations[_token][_amount], "ShroudConductor: Denomination not allowed");
        require(!commitments[_commitment], "ShroudConductor: Commitment already exists");

        if (_token == address(0)) { // ETH deposit
            require(msg.value == _amount, "ShroudConductor: Invalid ETH amount");
        } else { // ERC20 deposit
            require(msg.value == 0, "ShroudConductor: ETH sent with ERC20 deposit");
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }

        commitments[_commitment] = true;
        emit Deposit(_token, _amount, _commitment, block.timestamp, false);
    }

    // --- CUSTOM DEPOSIT ---
    function depositCustom(address _token, uint256 _amount, bytes32 _commitment) external payable {
        require(_amount > 0, "ShroudConductor: Amount must be > 0");
        require(!commitments[_commitment], "ShroudConductor: Commitment already exists");

        if (_token == address(0)) {
            require(msg.value == _amount, "ShroudConductor: Invalid ETH amount");
        } else {
            require(msg.value == 0, "ShroudConductor: ETH sent with ERC20 deposit");
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }

        commitments[_commitment] = true;
        emit Deposit(_token, _amount, _commitment, block.timestamp, true);
    }

    // --- THE REAL ZK WITHDRAWAL FUNCTION ---
    function withdraw(
        // The proof is now broken into its three components from snarkjs
        uint256[2] calldata _a,
        uint256[2][2] calldata _b,
        uint256[2] calldata _c,
        // The public signals are now a fixed-size array from snarkjs
        uint256[4] calldata _publicSignals,
        // Additional data not part of the proof, required for the transaction logic
        address _token,
        uint256 _amount
    ) external {
        // Unpack public signals to be used in our logic.
        // The order MUST match the `main` component of your `withdraw.circom` file:
        // public [merkleRoot, nullifierHash, recipient, commitment]
        bytes32 nullifierHash = bytes32(_publicSignals[1]);
        address recipient = address(uint160(_publicSignals[2]));
        bytes32 commitment = bytes32(_publicSignals[3]);

        // Perform critical on-chain checks
        require(commitments[commitment], "ShroudConductor: Commitment does not exist");
        require(!nullifiers[nullifierHash], "ShroudConductor: Nullifier has been spent");
        
        bool isStandard = allowedDenominations[_token][_amount];
        require(isStandard || _amount > 0, "ShroudConductor: Invalid amount for withdrawal");

        // Call the REAL ZK verifier contract to validate the cryptographic proof
        require(verifier.verifyProof(_a, _b, _c, _publicSignals), "ShroudConductor: Invalid ZK proof");
        
        // Mark the nullifier as spent to prevent double-spending
        nullifiers[nullifierHash] = true;
        
        // Execute the fund transfer based on the token type
        if (_token == address(0)) {
            payable(recipient).transfer(_amount);
        } else {
            IERC20(_token).transfer(recipient, _amount);
        }

        // Emit an event to log the successful withdrawal
        emit Withdrawal(_token, _amount, recipient, nullifierHash, !isStandard);
    }
}