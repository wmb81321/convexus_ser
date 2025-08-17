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
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Denylist} from "./modules/common/Denylist.sol";
import {Domain} from "./modules/common/Domain.sol";
import {Pausing} from "./modules/common/Pausing.sol";
import {TokenSupport} from "./modules/common/TokenSupport.sol";
import {TransferSpecHashes} from "./modules/common/TransferSpecHashes.sol";

/// @title GatewayCommon
///
/// @notice Contains functionality that is common between `GatewayWallet` and `GatewayMinter`
contract GatewayCommon is
    Initializable,
    UUPSUpgradeable,
    Ownable2StepUpgradeable,
    Pausing,
    Denylist,
    TokenSupport,
    TransferSpecHashes,
    Domain
{
    /// Initializes all of the common modules, in the order of inheritance
    ///
    /// @param pauser_            The address to initialize the `pauser` role
    /// @param denylister_        The address to initialize the `denylister` role
    /// @param supportedTokens_   The list of tokens to support initially
    /// @param domain_            The operator-issued identifier for this chain
    function __GatewayCommon_init(
        address pauser_,
        address denylister_,
        address[] calldata supportedTokens_,
        uint32 domain_
    ) internal onlyInitializing {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __Pausing_init(pauser_);
        __Denylist_init(denylister_);
        __TokenSupport_init(supportedTokens_);
        __TransferSpecHashes_init();
        __Domain_init(domain_);
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
