import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom' 
import { Navbar } from './components/navbar';



function App() {

  return (
    <Router>
      <Navbar />
    </Router>
  )
}

export default App
