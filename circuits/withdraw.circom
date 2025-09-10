pragma circom 2.0.0;

include "circomlib/poseidon.circom";
include "circomlib/merkle.circom";

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
    signal input root;
    signal input nullifierHash;
    signal input recipient;
    signal input relayer;
    signal input fee;

    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component commitmentHasher = CommitmentHasher();
    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;
    signal commitment <== commitmentHasher.commitment;

    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHasher.out === nullifierHash;

    component merkleProof = MerkleProof(levels);
    merkleProof.leaf <== commitment;
    for (var i = 0; i < levels; i++) {
        merkleProof.pathElements[i] <== pathElements[i];
        merkleProof.pathIndices[i] <== pathIndices[i];
    }
    merkleProof.root === root;
}

// DEFINITIVE CORRECTION:
// This line declares the public inputs for the entire circuit.
component main { public [ root, nullifierHash, recipient, relayer, fee ] } = Withdraw(20);