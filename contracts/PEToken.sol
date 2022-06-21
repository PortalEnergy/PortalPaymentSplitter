// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PEToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {

    uint256 public initialTokenSupply;

    function initialize(string memory name, string memory symbol, uint256 supply) public virtual initializer {
        initialTokenSupply = supply * (10 ** uint256(decimals()));
        __ERC20_init(name, symbol);
        _mint(msg.sender, initialTokenSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }
    
}


