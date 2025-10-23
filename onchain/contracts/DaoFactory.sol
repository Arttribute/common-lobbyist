// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {GovernanceToken} from "./GovernanceToken.sol";
import {SignalRegistry} from "./SignalRegistry.sol";

/// @title DAOFactory
/// @notice Deploys a GovernanceToken + SignalRegistry pair for each DAO and records metadata.
contract DAOFactory {
    struct DaoInfo {
        address daoOwner;
        address token;
        address signalRegistry;
        string  metadataCid; // optional: IPFS CID for DAO profile
        bool    exists;
    }

    mapping(address => DaoInfo) public daos; // keyed by signalRegistry (or owner if you prefer)
    event DaoCreated(address indexed daoOwner, address token, address signalRegistry, string metadataCid);

    function createDAO(
        string calldata name_,
        string calldata symbol_,
        uint256 initialSupply,
        string calldata metadataCid
    ) external returns (address tokenAddr, address registryAddr) {
        GovernanceToken token = new GovernanceToken(name_, symbol_, msg.sender, initialSupply);
        SignalRegistry registry = new SignalRegistry(msg.sender, token);

        DaoInfo storage info = daos[address(registry)];
        info.daoOwner = msg.sender;
        info.token = address(token);
        info.signalRegistry = address(registry);
        info.metadataCid = metadataCid;
        info.exists = true;

        emit DaoCreated(msg.sender, address(token), address(registry), metadataCid);
        return (address(token), address(registry));
    }
}
