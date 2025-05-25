---
sidebar_position: 2
---

# System Block Diagram
![System Block Diagram](/img/SystemBlockDiagram.png)
**Figure 1.** High level design of the AAC Hungry Hippos application.
# Description
Our project is built using React for the front-end and Firebase for the back-end. The app is hosted through GitHub Pages, which loads the React interface in the user's browser. We are using Firebase Realtime Database to handle game state such as players score and the fruit queue system, as well as multiplayer session data. Firebase Authentication is used to sign in users anonymously  without the need to create an account, and helps limit access to certain parts of the database. Only authorized users who join a session get access to the session's game state.

The AAC user and the other players connect through the same front-end. It's responsible for presenting the graphical interface to the user, making the fruits fall, registering when users click a fruit, and keeping track of the score. Everything is sent to Firebase Realtime Database to sync up the session between the users. 