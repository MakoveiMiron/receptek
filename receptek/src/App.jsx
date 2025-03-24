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
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal állapot
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Kiválasztott recept
  const [isEditing, setIsEditing] = useState(false); // Edit mode state
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://receptek-backend-production.up.railway.app/recipes`)  // Backend URL
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
      const response = await fetch(`https://receptek-backend-production.up.railway.app/recipes`, {
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

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
    setIsEditing(false); // Reset editing state when modal is closed
  };

  const handleEdit = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleSave = async () => {
    if (!selectedRecipe.body) {
      toast.error('A recept szövege nem lehet üres!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://receptek-backend-production.up.railway.app/recipes/${selectedRecipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: selectedRecipe.body }),
      });

      if (!response.ok) throw new Error('Hiba a recept mentése közben.');

      toast.success('Recept mentve!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Hiba történt a recept mentésekor!');
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
          <div key={recipe.id} className="recipe-item" onClick={() => openModal(recipe)}>
            <span>{recipe.name}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedRecipe && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedRecipe.name}</h2>
            <p>
              <a href={selectedRecipe.link} target="_blank" rel="noopener noreferrer">
                Eredeti recept link
              </a>
            </p>
            <div className="modal-body">
              {/* Display recipe body */}
              {!isEditing ? (
                <p>{selectedRecipe.body}</p>
              ) : (
                <textarea
                  value={selectedRecipe.body}
                  onChange={(e) => setSelectedRecipe({ ...selectedRecipe, body: e.target.value })}
                  style={{ height: '400px' }} // Set height for textarea
                />
              )}
            </div>
            <div className="modal-actions">
              <button onClick={closeModal}>Bezárás</button>
              {!isEditing ? (
                <button onClick={handleEdit}>Szerkesztés</button>
              ) : (
                <button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? <div className="spinner"></div> : 'Mentés'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default App;
