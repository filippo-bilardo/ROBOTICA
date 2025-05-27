/**
 * E-Learning Platform - Frontend App Component
 * Functional Programming Implementation Template
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { pipe } from 'ramda';

// Functional utilities
const withErrorBoundary = (Component) => (props) => {
  // Error boundary implementation
  return <Component {...props} />;
};

const withAuth = (Component) => (props) => {
  // Authentication HOC implementation
  return <Component {...props} />;
};

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Navigation from './components/layout/Navigation';

// Page components
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Functional composition for layout
const withLayout = (Component) => (props) => (
  <div className="app-layout">
    <Header />
    <Navigation />
    <main className="main-content">
      <Component {...props} />
    </main>
    <Footer />
  </div>
);

// Route configuration using functional patterns
const createRoute = (path, Component, requiresAuth = false) => ({
  path,
  element: pipe(
    requiresAuth ? withAuth : (x) => x,
    withLayout,
    withErrorBoundary
  )(Component)
});

const routes = [
  createRoute('/', Home),
  createRoute('/courses', Courses),
  createRoute('/courses/:id', CourseDetail),
  createRoute('/dashboard', Dashboard, true),
  createRoute('/profile', Profile, true),
  createRoute('/login', Login),
  createRoute('/register', Register)
];

// Main App component
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                {routes.map(({ path, element }, index) => (
                  <Route 
                    key={index} 
                    path={path} 
                    element={element} 
                  />
                ))}
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
