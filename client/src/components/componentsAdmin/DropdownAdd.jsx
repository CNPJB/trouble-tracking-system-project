// 🧩 ชิ้นส่วนสำเร็จรูป: Dropdown ที่มีปุ่มเพิ่มข้อมูล
import { useMemo, useState } from 'react'
export const DropdownWithAdd = ({
    name,             // ชื่อ field (เช่น 'floor', 'room')
    value,            // ค่าที่เลือกอยู่
    options,          // ข้อมูลที่จะเอามาวนลูปแสดง [{ id: '1', label: 'ห้อง 101' }, ...]
    onChange,         // ฟังก์ชันตอนเลือกข้อมูลปกติ
    onSaveNew,        // ฟังก์ชันตอนกดบันทึกข้อมูลใหม่
    placeholder,      // คำนำหน้า (เช่น 'เลือกชั้น', 'เลือกห้อง')
    addLabel          // คำที่ปุ่มสร้างใหม่ (เช่น 'สร้างชั้นใหม่')
}) => {
    // State ย่อยๆ พวกนี้จะถูกจัดการแยกกัน ไม่ตีกันแน่นอน!
    const [isAdding, setIsAdding] = useState(false);
    const [newValue, setNewValue] = useState('');

    const handleSelectChange = (e) => {
        if (e.target.value === 'CREATE_NEW') {
            setIsAdding(true);
        } else {
            onChange(e); // ส่งค่ากลับไปให้ฟอร์มหลัก
        }
    };

    const handleSave = () => {
        if (newValue.trim()) {
            onSaveNew(newValue); // ส่งชื่อใหม่กลับไปให้ฟอร์มหลักเซฟลง DB
            setIsAdding(false);
            setNewValue('');
        }
    };

    const handleCancel = () => {
        setIsAdding(false);     // ปิด Modal
        setNewValue('');        // ล้างค่าที่พิมพ์
    };

    return (
        <div style={{ marginBottom: '10px' }}>
            <select name={name} value={value || ''} onChange={handleSelectChange} className="form-control">
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.id} value={String(opt.id)}>
                        {opt.label}
                    </option>
                ))}
                <option value="CREATE_NEW">➕ {addLabel}</option>
            </select>

            {/* 🚨 ส่วนนี้แหละครับที่จะเด้งมากลางจอ (Modal) */}
            {isAdding && (
                <div style={{
                    position: 'fixed', // ยึดติดกับหน้าจอ
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // พื้นหลังสีดำโปร่งแสง (จางๆ)
                    display: 'flex',
                    justifyContent: 'center', // จัดให้อยู่ตรงกลางแนวนอน
                    alignItems: 'center',     // จัดให้อยู่ตรงกลางแนวตั้ง
                    zIndex: 1000              // ดันให้อยู่ชั้นบนสุด ไม่ให้โดนอันอื่นบัง
                }}>

                    {/* กล่องสีขาวที่อยู่ตรงกลาง */}
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '25px',
                        borderRadius: '10px',
                        width: '350px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        textAlign: 'center'
                    }}>
                        <h4 style={{ marginTop: 0, marginBottom: '20px' }}>{addLabel}</h4>

                        <input
                            type="text"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            placeholder={`พิมพ์${addLabel}...`}
                            className="form-control"
                            style={{ width: '100%', marginBottom: '20px', padding: '10px' }}
                            autoFocus 
                        />

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button type="button" onClick={handleSave} className="btn-confirm" style={{ padding: '8px 20px' }}>บันทึก</button>
                            <button type="button" onClick={handleCancel} className="btn-cancel" style={{ padding: '8px 20px' }}>ยกเลิก</button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};