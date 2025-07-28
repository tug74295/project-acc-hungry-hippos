---
sidebar_position: 1
---

# Component Descriptions

This page describes the different components and technologies that will be used to build the AAC Hungry Hippos project.

# Frontend
## React.js
`A component-based web framework used to design web applications.`  
`We will use React to construct our front-end user interface, including the AAC device and the main UI.`

## Phaser
`A fast, free, and open-source HTML5 game framework. We will use Phaser to create and manage the core Hungry Hippos gameplay.`  
`It will render the game on a HTML canvas, handling all game logic, physics, and sprites.`

## TypeScript
`A superset of JavaScript that adds static typing. We will use TypeScript for all frontend code (React and Phaser) to improve code quality, and make the application easier to maintain.`

---
# Backend

## Node.js
`A JavaScript runtime environment that executes code outside of a web browser. Node.js is the foundation of our custom backend server, allowing us to handle game logic and real-time communication.`

## WebSocket
`A library for Node.js that enables two-way, real-time communication between the client and server. This is the core technology that allows us to synchronize game state, player movements, and actions across all connected devices.`

---
# Deployment & Hosting

## PostgreSQL
`An open-source relational database. For our production environment hosted on Railway, we use a PostgreSQL database to provide persistent storage for game sessions and player data, ensuring that game states are durable and can be managed effectively.`

## Railway
`A cloud infastructure platform for deploying applications. We will use Railway to host a custom WebSocket server (built with node.js).`     
`It will manage live game connections and relay real-time actions between all players in a game session.`

## Vercel
`A cloud platform for deploying and hosting front-end applications.`  
`Vercel will be used to host our main React application.`

## Docusaurus
`A static site generator for building documentation websites. We will use Docusaurus to create and host all project-related documentation.`