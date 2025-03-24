import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function RecipePage() {
  const { id } = useParams(); // Get the recipe ID from the URL
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null); // State to hold the recipe data
  const [editedBody, setEditedBody] = useState(''); // State to handle the recipe body when editing
  const [isEditing, setIsEditing] = useState(false); // Toggle between view and edit mode

  // Fetch the recipe data when the component mounts or when the `id` changes
  useEffect(() => {
    fetch(`https://receptek-backend-production.up.railway.app/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipe(data); // Set the fetched recipe data
        setEditedBody(data.body); // Set the body of the recipe for editing
      })
      .catch((err) => {
        console.error(err);
        toast.error('Hiba történt a recept betöltésekor!');
      });
  }, [id]);

  // Function to save changes made to the recipe body
  const saveChanges = async () => {
    try {
      const response = await fetch(`https://receptek-backend-production.up.railway.app/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editedBody }),
      });

      if (!response.ok) throw new Error('Hiba a recept frissítése közben.');

      const updatedRecipe = await response.json();
      setRecipe(updatedRecipe); // Update the recipe in the state
      setIsEditing(false); // Exit editing mode
      toast.success('Recept mentése sikerült!');
    } catch (error) {
      toast.error('Hiba történt a recept mentése közben!');
      console.error(error);
    }
  };

  // Handle the cancel button for editing
  const cancelEdit = () => {
    setEditedBody(recipe.body); // Reset the body to the original content
    setIsEditing(false); // Exit editing mode
  };

  // If the recipe hasn't been loaded yet, show a loading message
  if (!recipe) return <p>Betöltés...</p>;

  return (
    <div className="container">
      <h2>{recipe.name}</h2>
      <p>
        <a href={recipe.link} target="_blank" rel="noopener noreferrer">
          Eredeti recept link
        </a>
      </p>

      {isEditing ? (
        <>
          <textarea
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)} // Update body content while editing
          />
          <div className="actions">
            <button onClick={saveChanges}>Mentés</button>
            <button onClick={cancelEdit}>Mégse</button>
          </div>
        </>
      ) : (
        <>
          <pre>{recipe.body}</pre>
          <div className="actions">
            <button onClick={() => setIsEditing(true)}>Szerkesztés</button>
          </div>
        </>
      )}

      <button onClick={() => navigate('/')}>Vissza a főoldalra</button>
    </div>
  );
}
