import React from 'react'
import './componentsStyles/SearchBar.css';

export const SearchBar = ({ onSearch }) => {
    const [search, setSearch] = React.useState("");

    const handleSubmit = (e) =>{
        e.preventDefault();
        onSearch(search)
    }
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={search}
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="ค้นหาที่นี่..." 
      />
      <button type="submit">ค้นหา</button>
    </form>
  )
}
