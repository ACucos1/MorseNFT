//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MorseV2 is ERC721Enumerable, Ownable {
    
    using Strings for uint256;

    string baseURI;
    string public baseExtension = ".json";
    uint256 public cost = 0.07 ether;
    uint256 public maxSupply = 10000;
    uint256 public maxMintAmount = 2;
    bool public paused = false;
    bool public revealed = false;
    string public notRevealedURI;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI,
        string memory _initNotRevealedURI
    ) ERC721(_name, _symbol){
        setBaseURI(_initBaseURI);
        setNotRevealedURI(_initNotRevealedURI);
    }

    function _baseURI() internal view virtual override returns(string memory){
        return baseURI;
    }

    function mint(uint256 _mintAmount) public payable{
        uint256 supply = totalSupply();
        require(!paused);
        require(_mintAmount > 0);
        require(_mintAmount <= maxMintAmount);
        require(supply + _mintAmount <= maxSupply);

        if(msg.sender != owner()){
            require(msg.value >= cost * _mintAmount);
        }

        for(uint256 i = 1; i <= _mintAmount; i++){
            _safeMint(msg.sender, supply+i);
        }
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory){
        uint256 ownerTokenCount = balanceOf(_owner);
        require(ownerTokenCount > 0, "Address has none of our NFTS");
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i = 0; i < ownerTokenCount; i++){
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistant token");
        if(revealed == false){
            return notRevealedURI;
        }

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension)) : "";
    }

    function reveal() public onlyOwner {
        revealed = true;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setMaxMintAmount(uint256 _newAmount) public onlyOwner {
        maxMintAmount = _newAmount;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedURI = _notRevealedURI;
    }

    function setBaseURI(string memory _URI) public onlyOwner {
        baseURI = _URI;
    }

    function setBaseExtension(string memory _baseExtension) public onlyOwner {
        baseExtension = _baseExtension;
    }

    function pause(bool _state) public onlyOwner{
        paused = _state;
    }

    function withdraw() public payable onlyOwner {
        /*
        SEND ARTIST ADDRESS 5% of transactions.
        (bool hs, ) = payable(<ARTIST WALLET ADDRESS>).call{value: address(this.balance) * 5 /100("")};
        require(hs);
        */

        //Send contract balance to owner contract.
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}