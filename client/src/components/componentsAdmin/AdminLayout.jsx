import   { AdminSidebar }  from "./AdminSidebar.jsx";
import { Outlet } from 'react-router-dom';
import React  , {children} from "react";

export const AdminLayout = () => {
  return (
    <div className="admin-container" style={{ display: 'flex' }}>
      {/* 1. ส่วนคงที่ที่จะปรากฏทุกหน้าแอดมิน */}
      <AdminSidebar /> 

      <div className="admin-body" style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

