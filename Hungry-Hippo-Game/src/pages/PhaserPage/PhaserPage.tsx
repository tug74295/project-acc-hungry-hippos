import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PhaserGame, IRefPhaserGame } from '../../PhaserGame';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { AacFood } from '../../Foods';
import { EventBus } from '../../game/EventBus';
import Leaderboard from '../../components/Leaderboard/Leaderboard';
/**
 * PhaserPage component.
 *
 * Displays the Phaser game canvas and shows the currently selected food visually.
 * Listens to WebSocket messages to update the game scene with the latest selected food.
 *
 * @component
 * @returns {JSX.Element} The rendered Phaser game interface with current food indicator.
 */
const PhaserPage: React.FC = () => {
  /**
   * Extract sessionId and userId from the URL parameters.
   */
  const { sessionId, userId } = useParams<{ sessionId: string, userId: string }>();

  /**
   * Access the React Router location object to get passed state (including user role).
   */
  const location = useLocation();

  /**
   * Ref to the PhaserGame component instance, to call Phaser scene methods.
   */
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  /**
   * Holds the currently selected food object to display.
   */
  const [currentFood, setCurrentFood] = useState<AacFood | null>(null);

  const [scores, setScores] = useState<Record<string, number>>({});

  /**
   * WebSocket context values: lastMessage received, sendMessage function, and a function to clear last message.
   */
  const {connectedUsers, lastMessage, sendMessage, clearLastMessage } = useWebSocket();

  /**
   * Effect hook to send a "PLAYER_JOIN" message over WebSocket when component mounts,
   * informing the server about the player's session, userId, and role.
   *
   * Dependencies:
   * - sessionId, userId: URL parameters identifying player/session.
   * - location.state?.role: User role passed in navigation state.
   * - sendMessage: WebSocket send function.
   */
  useEffect(() => {
    const role = location.state?.role;
    if (sessionId && userId && role) {
      sendMessage({
        type: 'PLAYER_JOIN',
        payload: { sessionId, userId, role }
      });
    }
  }, [sessionId, userId, location.state?.role, sendMessage]);



  // useEffect(() => {
  //   const scene = phaserRef.current?.scene as any;
  
  //   if (scene && userId && connectedUsers) {
  //     scene.init({
  //       sendMessage,
  //       localPlayerId: userId,
  //       connectedUsers
  //     });
  //   }
  // }, [phaserRef.current?.scene, sendMessage, userId, connectedUsers]);
  
    // Listens for broadcasts from the server about food selection
    useEffect(() => {
        if (lastMessage?.type === 'FOOD_SELECTED_BROADCAST') {

            const { foods } = lastMessage.payload;
            const scene = phaserRef.current?.scene as any;

            if (Array.isArray(foods)) {
                foods.forEach(({ food, angle }: { food: AacFood, angle: number }) => {
                    if (scene && typeof scene.addFoodManually === 'function') {
                        scene.addFoodManually(food.id, angle);
                    }
                });

                if (foods.length > 0 && typeof scene.setTargetFood === 'function') {
                    scene.setTargetFood(foods[0].food.id);
                    setCurrentFood(foods[0].food);
                }
            }
            if (clearLastMessage) clearLastMessage();
        }

        if (lastMessage?.type === 'FRUIT_EATEN_BROADCAST') {
            const { foodId, x, y } = lastMessage.payload;
            const scene = phaserRef.current?.scene as any;

            if (scene && typeof scene.removeFruitAt === 'function') {
                scene.removeFruitAt(foodId, x, y);
            }
        }
    }, [lastMessage, clearLastMessage]);

    /**
     * Listens for fruit-eaten events emitted from the Phaser scene,
     * and sends a WebSocket message to the server with fruit info.
    */
    useEffect(() => {
        const handleFruitEaten = ({ foodId, x, y }: { foodId: string; x: number; y: number }) => {
            if (sessionId) {
                sendMessage({
                    type: 'FRUIT_EATEN',
                    payload: { sessionId, foodId, x, y }
                });
            }
        };

        EventBus.on('fruit-eaten', handleFruitEaten);

        return () => {
            EventBus.off('fruit-eaten', handleFruitEaten);
        };
    }, [sendMessage, sessionId]);


    /**
     * Listens for fruit-eaten events emitted from the Phaser scene,
     * and sends a WebSocket message to the server with fruit info.
    */
    useEffect(() => {
        const handleFruitEaten = ({ foodId, x, y }: { foodId: string; x: number; y: number }) => {
            if (sessionId) {
                sendMessage({
                    type: 'FRUIT_EATEN',
                    payload: { sessionId, foodId, x, y }
                });
            }
        };

        EventBus.on('fruit-eaten', handleFruitEaten);

        return () => {
            EventBus.off('fruit-eaten', handleFruitEaten);
        };
    }, [sendMessage, sessionId]);

    useEffect(() => {
      const handleScoreUpdate = ({ scores }: { scores: Record<string, number> }) => {
        setScores(scores);
      };

      EventBus.on('scoreUpdate', handleScoreUpdate);

      return () => {
        EventBus.off('scoreUpdate', handleScoreUpdate);
      };
    }, []);


  /**
   * Render the PhaserGame component and the current food indicator UI.
   */
  return (
    <div className="game-container">
      <PhaserGame ref={phaserRef} currentActiveScene={(scene: Phaser.Scene) => {
        if (scene && userId && connectedUsers && typeof (scene as any).init === 'function') {
          (scene as any).init({
            sendMessage,
            localPlayerId: userId,
            sessionId,
            connectedUsers
          });
        }
      }} />

      {/* Box for Current Food */}
      <div className="current-food-indicator">
        <h3>Current Food to Eat:</h3>
        {currentFood ? (
          <>
            <img
              src={currentFood.imagePath}
              alt={currentFood.name}
              className="current-food-image"
            />
            <p className="current-food-name">{currentFood.name}</p>
          </>
        ) : (
          <p className="current-food-placeholder">No Food Selected</p>
        )}
      </div>

      {/*Leaderboard box */}
      <div className="leaderboard-box">
        <Leaderboard scores={scores} />
      </div> 
    </div>
  );
};

export default PhaserPage;
