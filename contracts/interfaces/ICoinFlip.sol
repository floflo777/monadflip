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

    event GameCreated(
        uint256 indexed gameId,
        address indexed player1,
        uint256 betAmount,
        bool player1Choice,
        uint256 expirationTime,
        address referrer
    );

    event GameJoined(
        uint256 indexed gameId,
        address indexed player2
    );

    event GameResolved(
        uint256 indexed gameId,
        address indexed winner,
        bool result,
        uint256 payout
    );

    event GameCancelled(
        uint256 indexed gameId,
        address indexed player1
    );

    event ReferralReward(
        address indexed referrer,
        uint256 amount,
        uint256 indexed gameId
    );

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

    function getOpenGames() external view returns (uint256[] memory);

    function getMyGames(address _player) external view returns (uint256[] memory);
}
