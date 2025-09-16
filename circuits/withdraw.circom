pragma circom 2.0.0;

include "circomlib/poseidon.circom";
include "circomlib/merkle.circom";
include "circomlib/bitify.circom";

// Commitment is a 2-input hash of secret and nullifier.
template CommitmentHasher() {
    signal input secret;
    signal input nullifier;
    signal output commitment;
    component hasher = Poseidon(2);
    hasher.inputs[0] <== secret;
    hasher.inputs[1] <== nullifier;
    commitment <== hasher.out;
}

template Withdraw(levels) {
    // Public inputs
    signal input root;
    signal input nullifierHash;
    signal input recipient;
    signal input relayer;
    signal input fee;

    // Private inputs
    signal input nullifier;
    signal input secret;
    signal input memoHash;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component commitmentHasher = CommitmentHasher();
    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;
    signal commitment <== commitmentHasher.commitment;

    // Nullifier hash is Poseidon(nullifier, memoHash).
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHasher.inputs[1] <== memoHash;
    nullifierHasher.out === nullifierHash;

    component merkleProof = MerkleProof(levels);
    merkleProof.leaf <== commitment;
    for (var i = 0; i < levels; i++) {
        merkleProof.pathElements[i] <== pathElements[i];
        merkleProof.pathIndices[i] <== pathIndices[i];
    }
    merkleProof.root === root;
}

component main { public [ root, nullifierHash, recipient, relayer, fee ] } = Withdraw(20);
