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
    
    // Core mappings
    mapping(uint256 => Game) private games;
    mapping(address => uint256) public referralEarnings;
    
    // Optimization indexes
    uint256[] private activeGameIds;
    mapping(uint256 => uint256) private gameIdToActiveIndex;
    mapping(address => uint256[]) private playerToGameIds;
    mapping(address => mapping(uint256 => uint256)) private playerGameIdToIndex;
    
    // Protocol stats
    uint256 public totalGamesCreated;
    uint256 public totalGamesResolved;
    uint256 public totalVolume;
    uint256 public totalPlayers;
    mapping(address => bool) private hasPlayed;
    
    // Player stats
    mapping(address => PlayerStats) public playerStats;
    
    // Referral stats
    mapping(address => ReferralStats) public referralStats;
    
    // Pause mechanism
    bool public paused;
    
    constructor() {
        owner = payable(msg.sender);
        paused = false;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createGame(
        uint256 _betAmount,
        bool _choice,
        uint256 _duration,
        address _referrer
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value == _betAmount, "Incorrect amount sent");
        require(_betAmount >= MIN_BET, "Bet too low");
        require(_duration >= 3600 && _duration <= 86400, "Invalid duration");
        
        if (_referrer == msg.sender || _referrer == address(0)) {
            _referrer = address(0);
        }

        uint256 gameId = gameIdCounter;
        unchecked {
            gameIdCounter++;
            totalGamesCreated++;
        }
        
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
        
        // Add to active games
        gameIdToActiveIndex[gameId] = activeGameIds.length;
        activeGameIds.push(gameId);
        
        // Add to player games
        playerGameIdToIndex[msg.sender][gameId] = playerToGameIds[msg.sender].length;
        playerToGameIds[msg.sender].push(gameId);
        
        // Track unique player
        if (!hasPlayed[msg.sender]) {
            hasPlayed[msg.sender] = true;
            unchecked {
                totalPlayers++;
            }
        }
        
        // Update player stats
        unchecked {
            playerStats[msg.sender].gamesCreated++;
            playerStats[msg.sender].totalVolume += _betAmount;
        }

        emit GameCreated(gameId, msg.sender, _betAmount, _choice, expirationTime, _referrer, block.timestamp);
        return gameId;
    }

    function joinGame(uint256 _gameId) external payable nonReentrant whenNotPaused {
        Game storage game = games[_gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already joined");
        require(msg.sender != game.player1, "Cannot join own game");
        require(msg.value == game.betAmount, "Incorrect bet amount");
        require(block.timestamp < game.expirationTime, "Game expired");
        require(!game.resolved, "Game already resolved");

        game.player2 = payable(msg.sender);
        
        // Add to player games
        playerGameIdToIndex[msg.sender][_gameId] = playerToGameIds[msg.sender].length;
        playerToGameIds[msg.sender].push(_gameId);
        
        // Track unique player
        if (!hasPlayed[msg.sender]) {
            hasPlayed[msg.sender] = true;
            unchecked {
                totalPlayers++;
            }
        }
        
        // Update player stats
        unchecked {
            playerStats[msg.sender].gamesJoined++;
            playerStats[msg.sender].totalVolume += game.betAmount;
        }
        
        emit GameJoined(_gameId, msg.sender, block.timestamp);
        
        _resolveGame(_gameId);
    }

    function cancelGame(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        
        require(msg.sender == game.player1, "Not game creator");
        require(game.player2 == address(0), "Game already joined");
        require(!game.resolved, "Game already resolved");

        game.resolved = true;
        
        // Remove from active games
        _removeFromActiveGames(_gameId);
        
        game.player1.transfer(game.betAmount);
        
        emit GameCancelled(_gameId, msg.sender, block.timestamp);
    }

    function withdrawExpired(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        
        require(msg.sender == game.player1, "Not game creator");
        require(game.player2 == address(0), "Game was joined");
        require(block.timestamp >= game.expirationTime, "Not expired yet");
        require(!game.resolved, "Already resolved");

        game.resolved = true;
        
        // Remove from active games
        _removeFromActiveGames(_gameId);
        
        game.player1.transfer(game.betAmount);
        
        emit GameExpired(_gameId, block.timestamp);
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
        
        // Remove from active games
        _removeFromActiveGames(_gameId);
        
        uint256 totalPot = game.betAmount * 2;
        uint256 houseFee = (totalPot * HOUSE_FEE_BPS) / 10000;
        uint256 referralFee = 0;
        
        if (game.referrer != address(0)) {
            referralFee = (totalPot * REFERRAL_FEE_BPS) / 10000;
            referralEarnings[game.referrer] += referralFee;
            
            unchecked {
                referralStats[game.referrer].totalEarned += referralFee;
                referralStats[game.referrer].gamesReferred++;
            }
            
            payable(game.referrer).transfer(referralFee);
            emit ReferralReward(game.referrer, referralFee, _gameId, block.timestamp);
        }
        
        uint256 payout = totalPot - houseFee - referralFee;
        
        // Update global stats
        unchecked {
            totalGamesResolved++;
            totalVolume += totalPot;
        }
        
        // Update player stats
        address loser = player1Wins ? game.player2 : game.player1;
        unchecked {
            playerStats[game.winner].gamesWon++;
            playerStats[game.winner].totalWon += payout;
            playerStats[loser].gamesLost++;
        }
        
        owner.transfer(houseFee);
        game.winner.transfer(payout);
        
        emit GameResolved(_gameId, game.winner, result, payout, block.timestamp);
    }
    
    function _removeFromActiveGames(uint256 _gameId) internal {
        uint256 index = gameIdToActiveIndex[_gameId];
        uint256 lastIndex = activeGameIds.length - 1;
        
        if (index != lastIndex) {
            uint256 lastGameId = activeGameIds[lastIndex];
            activeGameIds[index] = lastGameId;
            gameIdToActiveIndex[lastGameId] = index;
        }
        
        activeGameIds.pop();
        delete gameIdToActiveIndex[_gameId];
    }

    // ========== VIEW FUNCTIONS - OPTIMIZED ==========

    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }
    
    function getGamesBatch(uint256[] calldata _gameIds) external view returns (Game[] memory) {
        Game[] memory result = new Game[](_gameIds.length);
        
        for (uint256 i = 0; i < _gameIds.length; i++) {
            result[i] = games[_gameIds[i]];
        }
        
        return result;
    }

    function getOpenGames() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            uint256 gameId = activeGameIds[i];
            if (games[gameId].player2 == address(0) && 
                block.timestamp < games[gameId].expirationTime) {
                unchecked { count++; }
            }
        }
        
        uint256[] memory openGameIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            uint256 gameId = activeGameIds[i];
            if (games[gameId].player2 == address(0) && 
                block.timestamp < games[gameId].expirationTime) {
                openGameIds[index] = gameId;
                unchecked { index++; }
            }
        }
        
        return openGameIds;
    }
    
    function getOpenGamesWithData(uint256 limit, uint256 offset) 
        external 
        view 
        returns (Game[] memory gamesData, uint256 totalCount) 
    {
        // Count open games
        uint256 count = 0;
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            uint256 gameId = activeGameIds[i];
            if (games[gameId].player2 == address(0) && 
                block.timestamp < games[gameId].expirationTime) {
                unchecked { count++; }
            }
        }
        
        totalCount = count;
        
        if (offset >= count) {
            return (new Game[](0), totalCount);
        }
        
        uint256 resultSize = count - offset;
        if (resultSize > limit) {
            resultSize = limit;
        }
        
        gamesData = new Game[](resultSize);
        uint256 currentIndex = 0;
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < activeGameIds.length && resultIndex < resultSize; i++) {
            uint256 gameId = activeGameIds[i];
            if (games[gameId].player2 == address(0) && 
                block.timestamp < games[gameId].expirationTime) {
                if (currentIndex >= offset) {
                    gamesData[resultIndex] = games[gameId];
                    unchecked { resultIndex++; }
                }
                unchecked { currentIndex++; }
            }
        }
        
        return (gamesData, totalCount);
    }

    function getMyGames(address _player) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256[] storage playerGames = playerToGameIds[_player];
        
        for (uint256 i = 0; i < playerGames.length; i++) {
            if (!games[playerGames[i]].resolved) {
                unchecked { count++; }
            }
        }
        
        uint256[] memory myGameIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < playerGames.length; i++) {
            uint256 gameId = playerGames[i];
            if (!games[gameId].resolved) {
                myGameIds[index] = gameId;
                unchecked { index++; }
            }
        }
        
        return myGameIds;
    }
    
    function getMyGamesWithData(address _player, uint256 limit, uint256 offset) 
        external 
        view 
        returns (Game[] memory gamesData, uint256 totalCount) 
    {
        uint256[] storage playerGames = playerToGameIds[_player];
        
        // Count unresolved games
        uint256 count = 0;
        for (uint256 i = 0; i < playerGames.length; i++) {
            if (!games[playerGames[i]].resolved) {
                unchecked { count++; }
            }
        }
        
        totalCount = count;
        
        if (offset >= count) {
            return (new Game[](0), totalCount);
        }
        
        uint256 resultSize = count - offset;
        if (resultSize > limit) {
            resultSize = limit;
        }
        
        gamesData = new Game[](resultSize);
        uint256 currentIndex = 0;
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < playerGames.length && resultIndex < resultSize; i++) {
            uint256 gameId = playerGames[i];
            if (!games[gameId].resolved) {
                if (currentIndex >= offset) {
                    gamesData[resultIndex] = games[gameId];
                    unchecked { resultIndex++; }
                }
                unchecked { currentIndex++; }
            }
        }
        
        return (gamesData, totalCount);
    }
    
    function getRecentGames(uint256 count) external view returns (Game[] memory) {
        if (count == 0 || gameIdCounter == 0) {
            return new Game[](0);
        }
        
        uint256 resultSize = count > gameIdCounter ? gameIdCounter : count;
        Game[] memory result = new Game[](resultSize);
        
        uint256 resultIndex = 0;
        for (uint256 i = gameIdCounter; i > 0 && resultIndex < resultSize; i--) {
            result[resultIndex] = games[i - 1];
            unchecked { resultIndex++; }
        }
        
        return result;
    }
    
    function getGamesByBetRange(uint256 minBet, uint256 maxBet, uint256 limit) 
        external 
        view 
        returns (Game[] memory) 
    {
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeGameIds.length && count < limit; i++) {
            uint256 gameId = activeGameIds[i];
            Game storage game = games[gameId];
            if (game.player2 == address(0) && 
                !game.resolved &&
                game.betAmount >= minBet && 
                game.betAmount <= maxBet &&
                block.timestamp < game.expirationTime) {
                unchecked { count++; }
            }
        }
        
        Game[] memory result = new Game[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < activeGameIds.length && index < count; i++) {
            uint256 gameId = activeGameIds[i];
            Game storage game = games[gameId];
            if (game.player2 == address(0) && 
                !game.resolved &&
                game.betAmount >= minBet && 
                game.betAmount <= maxBet &&
                block.timestamp < game.expirationTime) {
                result[index] = game;
                unchecked { index++; }
            }
        }
        
        return result;
    }
    
    function getExpiringGames(uint256 timeWindow) external view returns (Game[] memory) {
        uint256 deadline = block.timestamp + timeWindow;
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            uint256 gameId = activeGameIds[i];
            Game storage game = games[gameId];
            if (game.player2 == address(0) && 
                !game.resolved &&
                game.expirationTime <= deadline &&
                block.timestamp < game.expirationTime) {
                unchecked { count++; }
            }
        }
        
        Game[] memory result = new Game[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < activeGameIds.length && index < count; i++) {
            uint256 gameId = activeGameIds[i];
            Game storage game = games[gameId];
            if (game.player2 == address(0) && 
                !game.resolved &&
                game.expirationTime <= deadline &&
                block.timestamp < game.expirationTime) {
                result[index] = game;
                unchecked { index++; }
            }
        }
        
        return result;
    }

    // ========== STATS FUNCTIONS ==========
    
    function getProtocolStats() external view returns (ProtocolStats memory) {
        return ProtocolStats({
            totalGamesCreated: totalGamesCreated,
            totalGamesResolved: totalGamesResolved,
            totalVolume: totalVolume,
            totalPlayers: totalPlayers,
            activeGames: activeGameIds.length
        });
    }
    
    function getPlayerStats(address _player) external view returns (PlayerStats memory) {
        return playerStats[_player];
    }
    
    function getReferralStats(address _referrer) external view returns (ReferralStats memory) {
        return referralStats[_referrer];
    }
    
    function getTopPlayers(uint256 limit) external view returns (address[] memory, uint256[] memory) {
        // Note: This is a simple implementation. For production, consider off-chain indexing
        // This function is expensive and should be used sparingly
        
        address[] memory players = new address[](limit);
        uint256[] memory volumes = new uint256[](limit);
        
        // This would need a more sophisticated implementation with a proper leaderboard structure
        // For now, returning empty arrays as a placeholder
        
        return (players, volumes);
    }

    // ========== REFERRAL FUNCTIONS ==========

    function withdrawReferralEarnings() external nonReentrant {
        uint256 amount = referralEarnings[msg.sender];
        require(amount > 0, "No earnings");
        
        referralEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        
        emit ReferralWithdrawn(msg.sender, amount, block.timestamp);
    }

    // ========== ADMIN FUNCTIONS ==========
    
    function pause() external onlyOwner {
        paused = true;
        emit Paused(block.timestamp);
    }
    
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(block.timestamp);
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        owner.transfer(balance);
        emit EmergencyWithdraw(owner, balance, block.timestamp);
    }
}