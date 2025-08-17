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

/// @title AddressLib
///
/// @notice A library for address utilities
library AddressLib {
    /// Thrown when the zero address is provided but a non-zero address is required
    error ZeroAddress();

    /// Checks that an address is not the zero address
    ///
    /// @param addr   The address to check
    function _checkNotZeroAddress(address addr) internal pure {
        if (addr == address(0)) {
            revert ZeroAddress();
        }
    }

    /// Converts a bytes32 value to an address
    ///
    /// @param value   The bytes32 value to convert
    /// @return        The address representation
    function _bytes32ToAddress(bytes32 value) internal pure returns (address) {
        return address(uint160(uint256(value)));
    }

    /// Converts an address to a bytes32 value
    ///
    /// @param addr   The address to convert
    /// @return       The bytes32 representation
    function _addressToBytes32(address addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }
}
