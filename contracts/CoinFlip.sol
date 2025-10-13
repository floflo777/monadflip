// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ICoinFlip.sol";

contract CoinFlip is ICoinFlip, ReentrancyGuard {
    uint256 private gameIdCounter;
    address payable public immutable owner;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant HOUSE_FEE_BPS = 10;
    uint256 public constant REFERRAL_FEE_BPS = 5;
    
    mapping(uint256 => Game) private games;
    mapping(address => uint256) public referralEarnings;
    
    constructor() {
        owner = payable(msg.sender);
    }

    function createGame(
        uint256 _betAmount,
        bool _choice,
        uint256 _duration,
        address _referrer
    ) external payable nonReentrant returns (uint256) {
        require(msg.value == _betAmount, "Incorrect amount sent");
        require(_betAmount >= MIN_BET, "Bet too low");
        require(_duration >= 3600 && _duration <= 86400, "Invalid duration");
        
        if (_referrer == msg.sender) {
            _referrer = address(0);
        }

        uint256 gameId = gameIdCounter++;
        uint256 expirationTime = block.timestamp + _duration;

        games[gameId] = Game({
            player1: payable(msg.sender),
            player2: payable(address(0)),
            betAmount: _betAmount,
            winner: payable(address(0)),
            createTime: block.timestamp,
            expirationTime: expirationTime,
            player1Choice: _choice,
            referrer: _referrer,
            resolved: false
        });

        emit GameCreated(gameId, msg.sender, _betAmount, _choice, expirationTime, _referrer);
        return gameId;
    }

    function joinGame(uint256 _gameId) external payable nonReentrant {
        Game storage game = games[_gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already joined");
        require(msg.sender != game.player1, "Cannot join own game");
        require(msg.value == game.betAmount, "Incorrect bet amount");
        require(block.timestamp < game.expirationTime, "Game expired");
        require(!game.resolved, "Game already resolved");

        game.player2 = payable(msg.sender);
        
        emit GameJoined(_gameId, msg.sender);
        
        _resolveGame(_gameId);
    }

    function cancelGame(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        
        require(msg.sender == game.player1, "Not game creator");
        require(game.player2 == address(0), "Game already joined");
        require(!game.resolved, "Game already resolved");

        game.resolved = true;
        game.player1.transfer(game.betAmount);
        
        emit GameCancelled(_gameId, msg.sender);
    }

    function withdrawExpired(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        
        require(msg.sender == game.player1, "Not game creator");
        require(game.player2 == address(0), "Game was joined");
        require(block.timestamp >= game.expirationTime, "Not expired yet");
        require(!game.resolved, "Already resolved");

        game.resolved = true;
        game.player1.transfer(game.betAmount);
    }

    function _resolveGame(uint256 _gameId) internal {
        Game storage game = games[_gameId];
        
        bytes32 blockHash = blockhash(block.number - 1);
        uint256 randomNum = uint256(keccak256(abi.encodePacked(
            blockHash,
            game.player1,
            game.player2,
            game.betAmount,
            block.timestamp
        )));
        
        bool result = (randomNum % 2) == 0;
        bool player1Wins = (result == game.player1Choice);
        
        game.winner = player1Wins ? game.player1 : game.player2;
        game.resolved = true;
        
        uint256 totalPot = game.betAmount * 2;
        uint256 houseFee = (totalPot * HOUSE_FEE_BPS) / 10000;
        uint256 referralFee = 0;
        
        if (game.referrer != address(0)) {
            referralFee = (totalPot * REFERRAL_FEE_BPS) / 10000;
            referralEarnings[game.referrer] += referralFee;
            payable(game.referrer).transfer(referralFee);
            emit ReferralReward(game.referrer, referralFee, _gameId);
        }
        
        uint256 payout = totalPot - houseFee - referralFee;
        owner.transfer(houseFee);
        game.winner.transfer(payout);
        
        emit GameResolved(_gameId, game.winner, result, payout);
    }

    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getOpenGames() external view returns (uint256[] memory) {
        uint256 openCount = 0;
        
        for (uint256 i = 0; i < gameIdCounter; i++) {
            if (games[i].player2 == address(0) && 
                !games[i].resolved && 
                block.timestamp < games[i].expirationTime) {
                openCount++;
            }
        }
        
        uint256[] memory openGameIds = new uint256[](openCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < gameIdCounter; i++) {
            if (games[i].player2 == address(0) && 
                !games[i].resolved && 
                block.timestamp < games[i].expirationTime) {
                openGameIds[index] = i;
                index++;
            }
        }
        
        return openGameIds;
    }

    function getMyGames(address _player) external view returns (uint256[] memory) {
        uint256 myCount = 0;
        
        for (uint256 i = 0; i < gameIdCounter; i++) {
            if ((games[i].player1 == _player || games[i].player2 == _player) && 
                !games[i].resolved) {
                myCount++;
            }
        }
        
        uint256[] memory myGameIds = new uint256[](myCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < gameIdCounter; i++) {
            if ((games[i].player1 == _player || games[i].player2 == _player) && 
                !games[i].resolved) {
                myGameIds[index] = i;
                index++;
            }
        }
        
        return myGameIds;
    }

    function withdrawReferralEarnings() external nonReentrant {
        uint256 amount = referralEarnings[msg.sender];
        require(amount > 0, "No earnings");
        
        referralEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
