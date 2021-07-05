// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PEToken is Initializable, ERC20Upgradeable {

    uint256 public initialTokenSupply;

    function initialize(string memory name, string memory symbol) public virtual initializer {
        initialTokenSupply = 10000000 * (10 ** uint256(decimals()));
        __ERC20_init(name, symbol);
        _mint(msg.sender, initialTokenSupply);
    }
    
}


