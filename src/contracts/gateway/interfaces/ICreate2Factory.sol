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

/// @title ICreate2Factory
///
/// @notice Interface for a factory that deploys contracts using CREATE2
interface ICreate2Factory {
    /// Deploys a contract using CREATE2
    ///
    /// @param salt       The salt to use for CREATE2 deployment
    /// @param bytecode   The bytecode of the contract to deploy
    /// @return           The address of the deployed contract
    function deploy(bytes32 salt, bytes memory bytecode) external returns (address);

    /// Deploys a contract using CREATE2 and executes multiple calls on it
    ///
    /// @param salt       The salt to use for CREATE2 deployment
    /// @param bytecode   The bytecode of the contract to deploy
    /// @param calls      The calls to execute on the deployed contract
    /// @return           The address of the deployed contract
    function deployAndMultiCall(
        bytes32 salt,
        bytes memory bytecode,
        bytes[] memory calls
    ) external returns (address);

    /// Computes the address that would be used for a CREATE2 deployment
    ///
    /// @param salt           The salt to use for CREATE2 deployment
    /// @param bytecodeHash   The keccak256 hash of the bytecode
    /// @return               The computed address
    function computeAddress(bytes32 salt, bytes32 bytecodeHash) external view returns (address);
}
