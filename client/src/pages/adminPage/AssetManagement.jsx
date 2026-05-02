import React from 'react'
import './AssetManagement.css'
// component
import { SearchBar } from '../../components/SearchBar';
// hook
import { useEquipment } from '../../hooks/useEquipment'

const AssetManagement = () => {

  const { equipment, refetch } = useEquipment();
  const formatStatus = {
    'active': 'ใช้งาน',
    'awaitingSale': 'รอขาย',
    'sentForRepair': 'รอส่งซ่อม',
    'Broken': 'ชำรุด'
  };

  return (
    <div className="assetManagement-container">
      <div className="filter-assetManagement-container">
        <div className="audit-issues-searchbar">
          <SearchBar />
        </div>
        <button>adasd</button>
        <button>adasd</button>
      </div>
      <div className="main-equiment-container">
        <table className="equipment-table">
          <thead>
            <tr>
              <th>ชื่อครุภัณฑ์</th>
              <th>รหัสครุภัณฑ์</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.equipmentCtgId} className="data-equipment-row">
                <td>{item.equipmentName}</td>
                <td>{item.equipmentCode}</td>
                <td>{formatStatus[item.equipmentStatus]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="edit-equipment-container">
        </div>
      </div>
    </div>
  )
}

export default AssetManagement