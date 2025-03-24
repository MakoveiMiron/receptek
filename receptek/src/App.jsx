import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RecipePage from './RecipePage';
import Modal from 'react-modal';
import './App.css';

Modal.setAppElement('#root');

function App() {
  const [recipes, setRecipes] = useState([]);
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
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
    setCurrentRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRecipe(null);
  };

  const handleSaveChanges = async () => {
    if (!currentRecipe.name || !currentRecipe.body) {
      toast.error('Kérlek, add meg a recept nevét és leírását!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://receptek-backend-production.up.railway.app/recipes/${currentRecipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentRecipe.name, body: currentRecipe.body }),
      });

      if (!response.ok) throw new Error('Hiba a recept mentése közben.');

      const updatedRecipe = await response.json();
      setRecipes(recipes.map((recipe) =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      ));

      toast.success('Recept mentése sikerült!');
      closeModal();
    } catch (error) {
      toast.error('Hiba történt a recept mentése közben!');
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
            <Link to={`/recipe/${recipe.id}`} onClick={() => openModal(recipe)}>
              {recipe.name}
            </Link>
          </div>
        ))}
      </div>

      {/* Modal for editing the recipe */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Recipe"
        className="modal"
        overlayClassName="overlay"
      >
        {currentRecipe && (
          <>
            <h2>Recept szerkesztése</h2>
            <input
              type="text"
              placeholder="Recept neve"
              value={currentRecipe.name}
              onChange={(e) => setCurrentRecipe({ ...currentRecipe, name: e.target.value })}
            />
            <textarea
              placeholder="Recept leírása"
              value={currentRecipe.body}
              onChange={(e) => setCurrentRecipe({ ...currentRecipe, body: e.target.value })}
            />
            <button onClick={handleSaveChanges}>Mentés</button>
            <button onClick={closeModal}>Mégse</button>
          </>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
}

export default App;
