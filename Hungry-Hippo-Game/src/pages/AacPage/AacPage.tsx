import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AacInterface from '../../aac/AacInterface';
import { AacFood } from '../../Foods';

/**
 * 
 * @component AacPage
 * @description
 * React functional component serving as the main AAC (Augmentative and Alternative Communication) interface page.
 * Allows the user to select foods via the AAC interface and tracks the selected food stack.
 *
 * Data Fields:
 * - foodStack: AacFood[]
 *    Stack of foods selected by the user. The most recent selection is at the top of the stack.
 * - loading: boolean
 *    Tracks whether the user validation request is in progress.
 * - valid: boolean
 *    Indicates if the user and session are valid and authorized to access this page.
 * - sessionId, userId: string | undefined
 *    Extracted from URL parameters, used for validation.
 *
 * Purpose:
 * - Validate the user’s session and authorization before allowing access.
 * - Display the AAC interface for selecting food.
 * - Maintain a stack of selected foods.
 *
 * Methods:
 * - validateUser(): Async function that calls backend to validate session and user.
 * - handleSelectedFood(selectedFood: AacFood): Adds selected food to the foodStack.
 *
 * Pre-conditions:
 * - Valid `sessionId` and `userId` must be present in URL params.
 * - Backend endpoint `/validate-user` must be available to validate user credentials.
 *
 * Post-conditions:
 * - If validation passes, the AAC interface is shown and user can select foods.
 * - If validation fails, redirects to home page.
 *
 * @returns {JSX.Element} The rendered AAC page with interface or loading state.
 */
const AacPage: React.FC = () => {
  /**
   * Extract sessionId and userId from URL parameters.
   */
  const { sessionId, userId } = useParams<{ sessionId: string; userId: string }>();

  /**
   * React Router navigation helper for redirects.
   */
  const navigate = useNavigate();

  /**
   * State for stack of selected foods. Most recent is first.
   */
  const [foodStack, setFoodStack] = useState<AacFood[]>([]);

  /**
   * Loading state during user validation.
   */
  const [loading, setLoading] = useState(true);

  /**
   * Flag indicating if user/session is valid.
   */
  const [valid, setValid] = useState(false);

  /**
   * useEffect to validate user/session when component mounts or sessionId/userId changes.
   */
  useEffect(() => {
    console.log('sessionId:', sessionId, 'userId:', userId);

    async function validateUser() {
      try {
        const res = await fetch('http://localhost:4000/validate-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId }),
        });
        const data = await res.json();
        console.log('Validation response:', data);

        if (res.ok && data.role === 'AAC User') {
          setValid(true);
        } else {
          navigate('/'); // invalid user/session/role, redirect home
        }
      } catch (error) {
        console.error('Validation failed:', error);
        navigate('/'); // network or server error, redirect home
      } finally {
        setLoading(false);
      }
    }

    validateUser();
  }, [sessionId, userId, navigate]);

  /**
   * Adds the selected food to the top of the food stack.
   * @param {AacFood} selectedFood - The food selected from the AAC interface.
   */
  const handleSelectedFood = (selectedFood: AacFood) => {
    setFoodStack(previousStack => [selectedFood, ...previousStack]);
        // Phaser spawning logic removed
  };

  /**
   * Display loading while validating.
   */
  if (loading) return <div>Loading...</div>;

  /**
   * If not valid after loading, render nothing (or optionally redirect).
   */
  if (!valid) return null;

  /**
   * Renders the AAC interface allowing food selection.
   * @returns {JSX.Element}
   */

  return (
    <div id="app">
            <AacInterface onFoodSelected={handleSelectedFood}/>
    </div>
  );
};

export default AacPage;
