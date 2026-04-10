import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom' 
import { Navbar } from './components/navbar';
import { CardFinishProblem } from './components/CardFinishProblem';
import Dashboard from './pages/Dashboard';
import DetailTicket from './pages/DetailTicket';



function App() {

  return (
    <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Ticketproblem" element={<DetailTicket />} />
        </Routes>
    </Router>
  )
}

export default App
