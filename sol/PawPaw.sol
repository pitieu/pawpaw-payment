// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.8.1/token/ERC20/ERC20.sol";

contract PawPaw is ERC20 {
    constructor() ERC20("PawPaw", "PAW") {}
}
