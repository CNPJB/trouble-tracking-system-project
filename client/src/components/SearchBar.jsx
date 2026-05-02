import React from 'react'
import './searchBar.css'

export const SearchBar = ({ onSearch }) => {
    const [search, setSearch] = React.useState("");

    const handleSubmit = (e) =>{
        e.preventDefault();
        console.log("1. ปุ่มถูกกดแล้ว, คำค้นหาคือ:", search);
        onSearch(search)
    }
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="ค้นหาที่นี่..." 
      />
      <button type="submit">ค้นหา</button>
    </form>
  )
}
