// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title TraceLockAnchor
 * @notice Cryptographic checkpoint anchoring contract for TraceLock Digital Evidence Integrity Platform.
 * @dev Deployed on Quai Network (Orchard Testnet / Cyprus-1 zone).
 *      Stores cryptographic root hashes of system audit logs off-chain without exposing sensitive logs.
 */
contract TraceLockAnchor {
    
    struct CheckpointAnchor {
        bytes32 checkpointId;      // Unique identifier (e.g., keccak256("CHK-2026-0042"))
        bytes32 rootHash;          // SHA-256 or Merkle root hash of the covered log chain
        uint256 recordCount;       // Number of audit records included in this checkpoint
        uint256 timestamp;         // Block timestamp when anchored
        uint256 blockNumber;       // Block height when anchored
        address submitter;         // Wallet address of the authorized anchoring agent
        bytes32 prevCheckpointId;  // Reference to prior checkpoint (hash pointer)
    }

    // Owner / administrator
    address public owner;
    
    // Mapping from checkpointId to CheckpointAnchor record
    mapping(bytes32 => CheckpointAnchor) private _checkpoints;
    
    // Array of all anchored checkpoint IDs in chronological order
    bytes32[] private _checkpointIds;

    // Events
    event CheckpointAnchored(
        bytes32 indexed checkpointId,
        bytes32 indexed rootHash,
        uint256 recordCount,
        address indexed submitter,
        uint256 timestamp,
        uint256 blockNumber
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "TraceLockAnchor: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Anchors a cryptographic checkpoint to Quai Network.
     * @param checkpointId Unique identifier for this checkpoint.
     * @param rootHash Cryptographic root hash representing the state of the logs.
     * @param recordCount Total number of records covered by this checkpoint.
     * @param prevCheckpointId Checkpoint ID of the immediately preceding anchor.
     */
    function anchorCheckpoint(
        bytes32 checkpointId,
        bytes32 rootHash,
        uint256 recordCount,
        bytes32 prevCheckpointId
    ) external returns (bool) {
        require(checkpointId != bytes32(0), "TraceLockAnchor: invalid checkpoint ID");
        require(rootHash != bytes32(0), "TraceLockAnchor: invalid root hash");
        require(recordCount > 0, "TraceLockAnchor: record count must be greater than zero");
        require(_checkpoints[checkpointId].timestamp == 0, "TraceLockAnchor: checkpoint already anchored (duplicate)");

        _checkpoints[checkpointId] = CheckpointAnchor({
            checkpointId: checkpointId,
            rootHash: rootHash,
            recordCount: recordCount,
            timestamp: block.timestamp,
            blockNumber: block.number,
            submitter: msg.sender,
            prevCheckpointId: prevCheckpointId
        });

        _checkpointIds.push(checkpointId);

        emit CheckpointAnchored(
            checkpointId,
            rootHash,
            recordCount,
            msg.sender,
            block.timestamp,
            block.number
        );

        return true;
    }

    /**
     * @notice Retrieves an existing checkpoint by its ID.
     */
    function getCheckpoint(bytes32 checkpointId) external view returns (
        bytes32 rootHash,
        uint256 recordCount,
        uint256 timestamp,
        uint256 blockNumber,
        address submitter,
        bytes32 prevCheckpointId
    ) {
        CheckpointAnchor memory cp = _checkpoints[checkpointId];
        require(cp.timestamp != 0, "TraceLockAnchor: checkpoint does not exist");
        return (
            cp.rootHash,
            cp.recordCount,
            cp.timestamp,
            cp.blockNumber,
            cp.submitter,
            cp.prevCheckpointId
        );
    }

    /**
     * @notice Verifies a local candidate root hash against the on-chain anchored hash.
     * @param checkpointId The checkpoint ID to verify.
     * @param localRootHash The locally recomputed root hash.
     * @return isMatch True if localRootHash exactly equals the anchored on-chain rootHash.
     * @return onChainRootHash The actual root hash stored on-chain.
     * @return timestamp Block timestamp of the anchor.
     */
    function verifyCheckpoint(bytes32 checkpointId, bytes32 localRootHash) external view returns (
        bool isMatch,
        bytes32 onChainRootHash,
        uint256 timestamp
    ) {
        CheckpointAnchor memory cp = _checkpoints[checkpointId];
        if (cp.timestamp == 0) {
            return (false, bytes32(0), 0);
        }
        return (cp.rootHash == localRootHash, cp.rootHash, cp.timestamp);
    }

    /**
     * @notice Returns the total number of checkpoints anchored to date.
     */
    function totalCheckpoints() external view returns (uint256) {
        return _checkpointIds.length;
    }

    /**
     * @notice Returns the checkpoint ID at a specific index.
     */
    function getCheckpointIdAt(uint256 index) external view returns (bytes32) {
        require(index < _checkpointIds.length, "TraceLockAnchor: index out of bounds");
        return _checkpointIds[index];
    }
}
