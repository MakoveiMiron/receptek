import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function RecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [editedBody, setEditedBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`https://your-backend-url.com/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipe(data);
        setEditedBody(data.body);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const saveChanges = async () => {
    try {
      const response = await fetch(`https://your-backend-url.com/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editedBody }),
      });

      if (!response.ok) throw new Error('Hiba a recept frissítése közben.');

      const updatedRecipe = await response.json();
      setRecipe(updatedRecipe);
      setIsEditing(false);
      toast.success('Recept mentése sikerült!');
    } catch (error) {
      toast.error('Hiba történt a recept mentése közben!');
      console.error(error);
    }
  };

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
            onChange={(e) => setEditedBody(e.target.value)}
          />
          <button onClick={saveChanges}>Mentés</button>
          <button onClick={() => setIsEditing(false)}>Mégse</button>
        </>
      ) : (
        <>
          <pre>{recipe.body}</pre>
          <button onClick={() => setIsEditing(true)}>Szerkesztés</button>
        </>
      )}

      <button onClick={() => navigate('/')}>Vissza a főoldalra</button>
    </div>
  );
}
