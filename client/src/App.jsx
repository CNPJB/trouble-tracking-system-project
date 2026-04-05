import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

// ตั้งค่า Base URL สำหรับ Axios (ชี้ไปที่ Port 3000 ของ Server)
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State สำหรับฟอร์มเพิ่ม User
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'user' // ค่าเริ่มต้นเป็น user
  });

  // ฟังก์ชันดึงข้อมูล (READ)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบว่า Server รันอยู่หรือไม่");
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลครั้งแรกเมื่อ Component โหลด
  useEffect(() => {
    fetchUsers();
  }, []);

  // ฟังก์ชันจัดการเมื่อพิมพ์ฟอร์ม
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ฟังก์ชันกด Submit เพื่อสร้าง User (CREATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      alert('สร้างผู้ใช้งานสำเร็จ!');
      setFormData({ email: '', fullName: '', role: 'user' }); // ล้างค่าฟอร์ม
      fetchUsers(); // รีเฟรชตารางใหม่
    } catch (err) {
      console.error("Error creating user:", err);
      alert('เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
    }
  };

  // ฟังก์ชันลบ User (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers(); // รีเฟรชตารางใหม่
      } catch (err) {
        console.error("Error deleting user:", err);
        alert('เกิดข้อผิดพลาดในการลบผู้ใช้งาน');
      }
    }
  };

  return (
    <div className="container">
      <h1>ระบบจัดการผู้ใช้งาน (ทดสอบ API)</h1>

      {/* ฟอร์มเพิ่มผู้ใช้งาน */}
      <div className="form-card">
        <h2>เพิ่มผู้ใช้งานใหม่</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>อีเมล:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>ชื่อ-นามสกุล:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>สิทธิ์การใช้งาน:</label>
            <select name="role" value={formData.role} onChange={handleInputChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </form>
      </div>

      {/* รายการผู้ใช้งาน */}
      <div className="list-card">
        <h2>รายชื่อผู้ใช้งานทั้งหมด ({users.length})</h2>
        {users.length === 0 ? (
          <p className="empty-text">ยังไม่มีข้อมูลผู้ใช้งาน</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.userId} className="user-item">
                <div className="user-info">
                  <strong>{user.fullName}</strong>
                  <span>{user.email}</span>
                </div>
                  <span className={`badge ${user.role}`}>{user.role}</span>
                  <button className="dltbutton" onClick={() => handleDelete(user.userId)}>
                    ลบ
                  </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App
