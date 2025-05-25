---
sidebar_position: 1
---

# System Overview
## Project Abstract
This project is a reimagined version of the classic Hungry Hungry Hippo game to empower children who use Augmentative and Alternative Communication (AAC) devices. While AAC devices are great for basic communication, they sometimes fall short in fast-pased uses like games. This can be a point of frustration and exclusion for AAC users, who want to play in group settings especially involving siblings or friends.

The goal of this project is to create a game where the AAC player is in control, such as of what fruits appear or how the gameplay progresses, while the non-AAC players interact with the game in response to the AAC player's choices.

## High Level Requirement
The game will be multiplayer where the AAC user will act as the host of the game, while non-AAC users play as hippos in a shared session. The AAC user uses their device to select fruits, triggering visual and audio feedback as fruits are launched into the arena. Each hippo is assigned a specific side of the screen and can move within their area to catch or ignore fruits earning them points for correct interactions all depending on the AAC user's selections and instructions.

## Conceptual Design
The game will be a web-based application built using React for the front end and Firebase for the backend. The system is hosted on GitHub Pages, which serves the React application directly in users’ browsers, making it accessible on any modern operating system. Game state data such as scores, fruit drops, and session information is handled using Firebase Realtime Database, also allowing for multiplayer. Firebase Authentication allows users to join sessions anonymously while restricting unauthorized access to session data.

## Background
AAC devices have become essential tools for supporting non-verbal communication, particularly among children with autism. These tools are highly effective in structured settings like requesting items or expressing needs but they often lack meaningful integration for fast-pased or collaborative activities. This project adds to the growing list of AAC-compatible games by adapting a well-known classic into an accessible multiplayer experience.

## Required Resources
[General Requirements Page](https://capstone-projects-2025-spring.github.io/project-acc-hungry-hippos/docs/requirements/general-requirements)