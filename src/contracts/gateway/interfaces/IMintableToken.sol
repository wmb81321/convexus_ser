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

/// @title IMintableToken
///
/// @notice Used to interact with a token that supports minting or a mint authority with the same interface
interface IMintableToken {
    /// Mints tokens to an address
    ///
    /// @dev The caller must be a minter and must not be blacklisted
    ///
    /// @param to       The address that will receive the minted tokens
    /// @param amount   The amount of tokens to mint. Must be less than or equal to the minter allowance of the caller.
    /// @return         `true` if the operation was successful, `false` otherwise
    function mint(address to, uint256 amount) external returns (bool);
}
