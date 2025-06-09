---
sidebar_position: 1
---

# Component Descriptions

This page describes the different components and technologies that will be used to build the AAC Hungry Hippos project.

## React.js
`A component-based web framework used to design web applications.`  
`We will use React to construct our front-end user interface, including the AAC device and the main UI.`

## Phaser
`A fast, free, and open-source HTML5 game framework. We will use Phaser to create and manage the core Hungry Hippos gameplay.`  
`It will render the game on a HTML canvas, handling all game logic, physics, and sprites.`

## Railway
`A cloud infastructure platform for deploying applications. We will use Railway to host a custom WebSocket server (built with node.js).`     
`It will manage live game connections and relay real-time actions between all players in a game session.`

## Firebase Realtime Database
`A cloud-hosted JSON database that lets you store and sync data between users in real-time.`  
`We will use it to store player UIDs and certain game session data such as a leaderboard.`

## Firebase Authentication
`A backend service that provides secure user authentication systems. We will use it to anonymously give users a UID for the sessions.`

## Vercel
`A cloud platform for deploying and hosting front-end applications.`  
`Vercel will be used to host our main React application.`

## Docusaurus
`A static site generator for building documentation websites. We will use Docusaurus to create and host all project-related documentation.`