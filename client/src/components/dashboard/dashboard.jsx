import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPackage, FiLayers, FiUser, FiLogOut } from 'react-icons/fi';
import './dashboard.css';

const Dashboard = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (!storedUser) {
      navigate('/');
    } else {
      setUsername(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  const cards = [
    { title: 'Total Stacks', icon: <FiLayers size={24} />, color: '#4CAF50', link: 'stacks' },
    { title: 'Place Order', icon: <FiShoppingCart size={24} />, color: '#2196F3', link: 'placeorder' },
    { title: 'New Order', icon: <FiPackage size={24} />, color: '#FF9800', link: 'order' },
    { title: 'Existing Stack', icon: <FiLayers size={24} />, color: '#9C27B0', link: 'exisitingstack' },
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
            <div className="profile-icon" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <FiUser size={20} />
              <span>{username}</span>
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
          {cards.map((card, index) => (
            <Link to={`/dashboard/${card.link}`} key={index} className="card" style={{ '--card-color': card.color }}>
              <div className="card-icon" style={{ backgroundColor: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
