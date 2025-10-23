// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SignalRegistry
/// @notice Members allocate tokens to IPFS CIDs ("place to remember") and can withdraw ("withdraw to forget").
///         Quadratic aggregation reduces whale dominance: totalQuadWeight = sum_{wallets}( floor(sqrt(userRaw)) ).
/// @dev One registry is deployed per DAO by the factory.
contract SignalRegistry is Ownable {
    using Math for uint256;

    IERC20 public immutable token;

    struct UserPosition {
        uint256 rawAmount;   // tokens allocated by user to this CID
        uint256 sqrtWeight;  // floor(sqrt(rawAmount))
    }

    struct MemoryAggregate {
        string  cid;             // human-readable CIDv1
        address dao;             // owning DAO (for indexing/composability)
        uint256 totalRaw;        // sum of raw allocations
        uint256 totalQuadWeight; // sum of users' sqrt weights
        uint32  supporters;      // unique wallets with rawAmount > 0
        bool    exists;
    }

    // cidHash = keccak256(bytes(cid))
    mapping(bytes32 => MemoryAggregate) public memories;
    // per CID per user
    mapping(bytes32 => mapping(address => UserPosition)) public positions;

    event Signaled(
        address indexed dao,
        bytes32 indexed cidHash,
        string cid,
        address indexed user,
        uint256 amountIn,
        uint256 userRawAfter,
        uint256 userSqrtAfter,
        uint256 totalRawAfter,
        uint256 totalQuadAfter
    );

    event Withdrawn(
        address indexed dao,
        bytes32 indexed cidHash,
        string cid,
        address indexed user,
        uint256 amountOut,
        uint256 userRawAfter,
        uint256 userSqrtAfter,
        uint256 totalRawAfter,
        uint256 totalQuadAfter
    );

    constructor(address daoOwner, IERC20 token_) Ownable(daoOwner) {
        token = token_;
    }

    /// @notice Allocate tokens to a CID string representing content pinned to IPFS.
    /// @param cid CIDv1 string (canonical human-readable)
    /// @param amount token amount to allocate (must be approved to this contract)
    function signal(string calldata cid, uint256 amount) external {
        require(amount > 0, "amount=0");

        bytes32 cidHash = keccak256(bytes(cid));
        MemoryAggregate storage m = memories[cidHash];
        if (!m.exists) {
            m.exists = true;
            m.cid = cid;
            m.dao = owner();
        }

        // Pull tokens
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

        // Update user position
        UserPosition storage p = positions[cidHash][msg.sender];
        uint256 prevRaw = p.rawAmount;
        uint256 prevSqrt = p.sqrtWeight;

        uint256 newRaw = prevRaw + amount;
        uint256 newSqrt = Math.sqrt(newRaw);

        p.rawAmount = newRaw;
        p.sqrtWeight = newSqrt;

        // Update aggregates
        if (prevRaw == 0) {
            m.supporters += 1;
        }
        m.totalRaw += amount;
        // adjust total quad = total - prevSqrt + newSqrt
        m.totalQuadWeight = m.totalQuadWeight + newSqrt - prevSqrt;

        emit Signaled(owner(), cidHash, m.cid, msg.sender, amount, newRaw, newSqrt, m.totalRaw, m.totalQuadWeight);
    }

    /// @notice Withdraw previously allocated tokens from a CID.
    function withdraw(string calldata cid, uint256 amount) external {
        require(amount > 0, "amount=0");
        bytes32 cidHash = keccak256(bytes(cid));
        MemoryAggregate storage m = memories[cidHash];
        require(m.exists, "unknown CID");

        UserPosition storage p = positions[cidHash][msg.sender];
        require(p.rawAmount >= amount, "insufficient allocated");

        uint256 prevRaw = p.rawAmount;
        uint256 prevSqrt = p.sqrtWeight;

        uint256 newRaw = prevRaw - amount;
        uint256 newSqrt = Math.sqrt(newRaw);

        p.rawAmount = newRaw;
        p.sqrtWeight = newSqrt;

        // Update aggregates
        m.totalRaw -= amount;
        m.totalQuadWeight = m.totalQuadWeight + newSqrt - prevSqrt;
        if (newRaw == 0) {
            // strictly reduce supporters when a user fully exits this CID
            m.supporters -= 1;
        }

        // Return tokens
        require(token.transfer(msg.sender, amount), "transfer failed");

        emit Withdrawn(owner(), cidHash, m.cid, msg.sender, amount, newRaw, newSqrt, m.totalRaw, m.totalQuadWeight);
    }

    /// @notice View data for a CID (by hash)
    function getMemoryByHash(bytes32 cidHash) external view returns (MemoryAggregate memory) {
        return memories[cidHash];
    }

    /// @notice Convenience: compute the cidHash off-chain identically
    function cidHashOf(string calldata cid) external pure returns (bytes32) {
        return keccak256(bytes(cid));
    }
}
