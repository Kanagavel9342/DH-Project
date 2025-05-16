import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiLayers,
  FiRefreshCw,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import './productiondashboard.css';

const Productiondashboard = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
const storedUsername = localStorage.getItem('productionUser'); 
    console.log('Fetched username:', storedUsername); // for debugging
    if (storedUsername && storedUsername.trim() !== '') {
      setUsername(storedUsername);
    } else {
      setUsername('User'); // fallback if username is not found
    }
  }, []);

  const handleLogout = () => {
    console.log('User logged out');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/admin-login');
    setIsProfileOpen(false);
  };

  const handleCardClick = (cardId) => {
    setActiveCard(cardId);
    switch (cardId) {
      case 1:
        navigate('/productionstacks');
        break;
      case 2:
        navigate('/productionorder');
        break;
      default:
        navigate('/');
    }
  };

  const cards = [
    { id: 1, title: 'Stacks', icon: <FiLayers size={24} />, color: '#4CAF50' },
    { id: 2, title: 'Order', icon: <FiShoppingCart size={24} />, color: '#2196F3' },
    // { id: 3, title: 'Order Update', icon: <FiRefreshCw size={24} />, color: '#FF9800' }
  ];

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="content-header">
          <div className="company-header">
            <h2 className="company-name" style={{ color: '#2196F3' }}>DH</h2>
            <h2 className="industries-text" style={{ color: 'white' }}>Industries</h2>
          </div>

          <div className="profile-section">
            <div 
              className="profile-icon" 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FiUser size={20} />
              <span>{` ${username}`}</span>
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <button onClick={handleLogout} className="logout-btn">
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="dashboard-cards">
          {cards.map((card) => (
            <div 
              key={card.id}
              className={`card ${activeCard === card.id ? 'active' : ''}`}
              style={{ '--card-color': card.color }}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="card-icon" style={{ backgroundColor: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Productiondashboard;
