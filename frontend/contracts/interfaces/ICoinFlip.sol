// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface ICoinFlip {
    struct Game {
        address payable player1;
        address payable player2;
        uint256 betAmount;
        address payable winner;
        uint256 createTime;
        uint256 expirationTime;
        bool player1Choice;
        address referrer;
        bool resolved;
    }
    
    struct PlayerStats {
        uint256 gamesCreated;
        uint256 gamesJoined;
        uint256 gamesWon;
        uint256 gamesLost;
        uint256 totalVolume;
        uint256 totalWon;
    }
    
    struct ReferralStats {
        uint256 totalEarned;
        uint256 gamesReferred;
    }
    
    struct ProtocolStats {
        uint256 totalGamesCreated;
        uint256 totalGamesResolved;
        uint256 totalVolume;
        uint256 totalPlayers;
        uint256 activeGames;
    }

    event GameCreated(
        uint256 indexed gameId,
        address indexed player1,
        uint256 betAmount,
        bool player1Choice,
        uint256 expirationTime,
        address referrer,
        uint256 timestamp
    );

    event GameJoined(
        uint256 indexed gameId,
        address indexed player2,
        uint256 timestamp
    );

    event GameResolved(
        uint256 indexed gameId,
        address indexed winner,
        bool result,
        uint256 payout,
        uint256 timestamp
    );

    event GameCancelled(
        uint256 indexed gameId,
        address indexed player1,
        uint256 timestamp
    );
    
    event GameExpired(
        uint256 indexed gameId,
        uint256 timestamp
    );

    event ReferralReward(
        address indexed referrer,
        uint256 amount,
        uint256 indexed gameId,
        uint256 timestamp
    );
    
    event ReferralWithdrawn(
        address indexed referrer,
        uint256 amount,
        uint256 timestamp
    );
    
    event Paused(uint256 timestamp);
    event Unpaused(uint256 timestamp);
    event EmergencyWithdraw(address indexed owner, uint256 amount, uint256 timestamp);

    function createGame(
        uint256 _betAmount,
        bool _choice,
        uint256 _duration,
        address _referrer
    ) external payable returns (uint256);

    function joinGame(uint256 _gameId) external payable;

    function cancelGame(uint256 _gameId) external;

    function withdrawExpired(uint256 _gameId) external;

    function getGame(uint256 _gameId) external view returns (Game memory);
    
    function getGamesBatch(uint256[] calldata _gameIds) external view returns (Game[] memory);

    function getOpenGames() external view returns (uint256[] memory);
    
    function getOpenGamesWithData(uint256 limit, uint256 offset) 
        external 
        view 
        returns (Game[] memory gamesData, uint256 totalCount);

    function getMyGames(address _player) external view returns (uint256[] memory);
    
    function getMyGamesWithData(address _player, uint256 limit, uint256 offset) 
        external 
        view 
        returns (Game[] memory gamesData, uint256 totalCount);
    
    function getRecentGames(uint256 count) external view returns (Game[] memory);
    
    function getProtocolStats() external view returns (ProtocolStats memory);
    
    function getPlayerStats(address _player) external view returns (PlayerStats memory);
    
    function getReferralStats(address _referrer) external view returns (ReferralStats memory);
}