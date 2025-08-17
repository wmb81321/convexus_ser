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

import {ICreate2Factory} from "./interfaces/ICreate2Factory.sol";

/// @title Create2Factory
///
/// @notice Factory contract for deterministic contract deployment using CREATE2
contract Create2Factory is ICreate2Factory {
    /// The deployer address that can deploy contracts
    address public immutable deployer;

    /// Thrown when a non-deployer tries to deploy
    error NotDeployer();

    /// Thrown when deployment fails
    error DeploymentFailed();

    constructor(address deployer_) {
        deployer = deployer_;
    }

    /// Ensures that only the deployer can call certain functions
    modifier onlyDeployer() {
        if (msg.sender != deployer) {
            revert NotDeployer();
        }
        _;
    }

    /// @inheritdoc ICreate2Factory
    function deploy(bytes32 salt, bytes memory bytecode) external onlyDeployer returns (address) {
        address deployedAddress;
        assembly {
            deployedAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        if (deployedAddress == address(0)) {
            revert DeploymentFailed();
        }
        
        return deployedAddress;
    }

    /// @inheritdoc ICreate2Factory
    function deployAndMultiCall(
        bytes32 salt,
        bytes memory bytecode,
        bytes[] memory calls
    ) external onlyDeployer returns (address) {
        // Deploy the contract
        address deployedAddress = this.deploy(salt, bytecode);
        
        // Execute multiple calls on the deployed contract
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, ) = deployedAddress.call(calls[i]);
            if (!success) {
                revert DeploymentFailed();
            }
        }
        
        return deployedAddress;
    }

    /// @inheritdoc ICreate2Factory
    function computeAddress(bytes32 salt, bytes32 bytecodeHash) external view returns (address) {
        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            bytecodeHash
                        )
                    )
                )
            )
        );
    }
}
