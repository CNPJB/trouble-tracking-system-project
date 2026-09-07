import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const AdminPageSkeleton = () => {
    return (
        <SkeletonTheme baseColor="#ebebeb" highlightColor="#ccc7c7" duration={2}>
            {/* กล่องคลุมหลัก เผื่อพื้นที่ Padding คล้ายๆ หน้าจริง */}
            <div style={{ padding: '20px', width: '100%', height: '100%' }}>
                
                {/* 1. ส่วนหัว (Header) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Skeleton width={250} height={40} borderRadius={8} />
                    <Skeleton width={120} height={40} borderRadius={8} />
                </div>
                
                {/* 2. ส่วนแถบเครื่องมือ (Toolbar / Filters) */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <Skeleton width={300} height={45} borderRadius={8} />
                    <Skeleton width={150} height={45} borderRadius={8} />
                    <Skeleton width={150} height={45} borderRadius={8} />
                </div>

                {/* 3. ส่วนเนื้อหา (Content Grid) - จำลองเป็นการ์ด 8 ใบ */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '20px' 
                }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '12px', 
                            padding: '16px',
                            backgroundColor: '#fff'
                        }}>
                            <Skeleton width="100%" height={160} borderRadius={8} style={{ marginBottom: '15px' }} />
                            <Skeleton width="70%" height={24} style={{ marginBottom: '10px' }} />
                            <Skeleton width="100%" height={16} count={2} style={{ marginBottom: '5px' }} />
                        </div>
                    ))}
                </div>
                
            </div>
        </SkeletonTheme>
    );
};
