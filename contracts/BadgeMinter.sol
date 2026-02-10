// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BadgeMinter is ERC721URIStorage {
    uint256 private _tokenIdCounter;
    mapping(address => mapping(uint256 => bool)) public hasMintedMilestone;

    event BadgeMinted(address indexed to, uint256 indexed tokenId, uint256 milestone);

    constructor() ERC721("WorkoutBadge", "WOB") {}

    function mintBadge(address to, uint256 milestone, string memory tokenURI) external {
        require(to == msg.sender, "Can only mint to self");
        require(!hasMintedMilestone[to][milestone], "Milestone already minted");

        _tokenIdCounter += 1;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        hasMintedMilestone[to][milestone] = true;

        emit BadgeMinted(to, newTokenId, milestone);
    }
}
