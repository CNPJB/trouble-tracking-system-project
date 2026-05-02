import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DateRangeFilter.css'

export const DateRangeFilter = ({ startDate, endDate, onChange }) => {

  // สร้างปุ่มจำแลงให้เป็นทรงแคปซูล
  const CustomButton = forwardRef(({ value, onClick }, ref) => (
    <button
      className="pill-select"
      onClick={onClick}
      ref={ref}
    >
      {value ? value : "เดือนปี ˅"} {/* ถ้ายังไม่เลือก จะขึ้นคำว่า เดือนปี */}
    </button>
  ));

  return (
    <DatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      customInput={<CustomButton />}
      dateFormat="dd/MMMM/yyyy"
      isClearable={true} // เพิ่มกากบาทให้กดลบวันที่ได้
    />
  );
};