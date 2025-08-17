/**
 * Copyright 2025 Circle Internet Group, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
pragma solidity ^0.8.29;

import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {AddressLib} from "../../lib/AddressLib.sol";

/// @title Pausing
///
/// @notice Manages a pauser role that can pause and unpause the contract
contract Pausing is Ownable2StepUpgradeable {
    /// Emitted when the contract is paused
    ///
    /// @param pauser   The address that paused the contract
    event Paused(address pauser);

    /// Emitted when the contract is unpaused
    ///
    /// @param pauser   The address that unpaused the contract
    event Unpaused(address pauser);

    /// Emitted when a pauser is added
    ///
    /// @param pauser   The pauser address that was added
    event PauserAdded(address indexed pauser);

    /// Emitted when a pauser is removed
    ///
    /// @param pauser   The pauser address that was removed
    event PauserRemoved(address indexed pauser);

    /// Thrown when a non-pauser tries to pause or unpause
    error NotPauser();

    /// Thrown when trying to call a function while paused
    error Paused();

    /// Initializes the pauser role
    ///
    /// @param pauser_   The address to initialize the `pauser` role
    function __Pausing_init(address pauser_) internal onlyInitializing {
        addPauser(pauser_);
    }

    /// Ensures that the caller is a pauser
    modifier onlyPauser() {
        if (!isPauser(msg.sender)) {
            revert NotPauser();
        }
        _;
    }

    /// Ensures that the contract is not paused
    modifier whenNotPaused() {
        if (paused()) {
            revert Paused();
        }
        _;
    }

    /// Whether or not the contract is paused
    ///
    /// @return   `true` if the contract is paused, `false` otherwise
    function paused() public view returns (bool) {
        return PausingStorage.get().paused;
    }

    /// Whether or not an address is a pauser
    ///
    /// @param pauser   The address to check
    /// @return         `true` if the address is a pauser, `false` otherwise
    function isPauser(address pauser) public view returns (bool) {
        return PausingStorage.get().pausers[pauser];
    }

    /// Pauses the contract
    ///
    /// @dev May only be called by a pauser
    function pause() external onlyPauser {
        PausingStorage.get().paused = true;
        emit Paused(msg.sender);
    }

    /// Unpauses the contract
    ///
    /// @dev May only be called by a pauser
    function unpause() external onlyPauser {
        PausingStorage.get().paused = false;
        emit Unpaused(msg.sender);
    }

    /// Adds a pauser
    ///
    /// @dev May only be called by the `owner` role
    ///
    /// @param pauser   The pauser address to add
    function addPauser(address pauser) public onlyOwner {
        AddressLib._checkNotZeroAddress(pauser);

        PausingStorage.get().pausers[pauser] = true;
        emit PauserAdded(pauser);
    }

    /// Removes a pauser
    ///
    /// @dev May only be called by the `owner` role
    ///
    /// @param pauser   The pauser address to remove
    function removePauser(address pauser) external onlyOwner {
        AddressLib._checkNotZeroAddress(pauser);

        PausingStorage.get().pausers[pauser] = false;
        emit PauserRemoved(pauser);
    }
}

/// @title PausingStorage
///
/// @notice Implements the EIP-7201 storage pattern for the `Pausing` module
library PausingStorage {
    /// @custom:storage-location erc7201:circle.gateway.Pausing
    struct Data {
        /// Whether or not the contract is paused
        bool paused;
        /// The addresses that may pause and unpause the contract
        mapping(address pauser => bool valid) pausers;
    }

    /// `keccak256(abi.encode(uint256(keccak256(bytes("circle.gateway.Pausing"))) - 1)) & ~bytes32(uint256(0xff))`
    bytes32 public constant SLOT = 0x9d13a4a5e7f6c6b8b2c1e1d8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f09900;

    /// EIP-7201 getter for the storage slot
    ///
    /// @return $   The storage struct for the `Pausing` module
    function get() internal pure returns (Data storage $) {
        assembly ("memory-safe") {
            $.slot := SLOT
        }
    }
}
