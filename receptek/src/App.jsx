import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RecipePage from './RecipePage';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://your-backend-url.com/recipes')  // Backend URL
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddRecipe = async () => {
    if (!link || !name) {
      toast.error('Kérlek, add meg a recept linkjét és nevét!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://your-backend-url.com/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link, name }),
      });

      if (!response.ok) throw new Error('Hiba a recept hozzáadása közben.');

      const newRecipe = await response.json();
      setRecipes([...recipes, newRecipe]);

      toast.success('Recept hozzáadva sikeresen!');
      navigate(`/recipe/${newRecipe.id}`);
    } catch (error) {
      toast.error('Hiba történt a recept hozzáadásakor!');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Receptek</h1>

      <div>
        <input
          type="text"
          placeholder="Recept link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <input
          type="text"
          placeholder="Recept neve"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAddRecipe} disabled={isLoading}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            'Hozzáadás'
          )}
        </button>
      </div>

      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-item">
            <Link to={`/recipe/${recipe.id}`}>{recipe.name}</Link>
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
