---
sidebar_position: 1
---

# System Overview
## Project Abstract
This project is a reimagined version of the classic Hungry Hungry Hippo game to empower children who use Augmentative and Alternative Communication (AAC) devices. While AAC devices are great for basic communication, they sometimes fall short in fast-pased uses like games. This can be a point of frustration and exclusion for AAC users, who want to play in group settings especially involving siblings or friends.

The goal of this project is to create a game where the AAC player is in control, such as of what foods appear or how the gameplay progresses, while the non-AAC players interact with the game in response to the AAC player's choices.

## High Level Requirement
The game is a multiplayer game where the AAC user acts as the central conductor of gameplay, while non-AAC users play as hippos in a shared session.  

Rather than controlling a hippo, the AAC player uses their interface to choose which foods should appear in the arena and what special effects, if any, should be applied to those foods. Each selection triggers visual and audio feedback and causes new foods to spawn in real time for the other players. 

Non-AAC players take the role of hippos that can move along the edges of the arena and try to catch foods that match the AAC user’s selection. Points are awarded for eating correct foods, and penalties may be applied for incorrect ones. Special effects like freezing, growing, etc. can also influence the outcome of the round. The game ends when the shared timer runs out, and scores are displayed for all participants.

## Conceptual Design
The game is implemented as a web application built using React for user interface components and Phaser for the arcade-style game engine. A WebSocket server deployed on Railway manages multiplayer synchronization, session tracking, food spawning, scoring, and event broadcasting. When the AAC user selects a food, the server queues it for launch and communicates the updated state to all players. Hippo players receive movement updates and collision events via WebSocket as well. 

The frontend is hosted on Vercel and is accessible from any device with a modern web browser. All assets including food images, audio prompts, and player avatars are loaded dynamically during gameplay. The system is designed allowing children with AAC needs to lead and participate in active game sessions.


## Background
AAC devices have become essential tools for supporting non-verbal communication, particularly among children with autism. These tools are highly effective in structured settings like requesting items or expressing needs but they often lack meaningful integration for fast-pased or collaborative activities. This project adds to the growing list of AAC-compatible games by adapting a well-known classic into an accessible multiplayer experience.

## Required Resources
[General Requirements Page](https://capstone-projects-2025-spring.github.io/project-acc-hungry-hippos/docs/requirements/general-requirements)