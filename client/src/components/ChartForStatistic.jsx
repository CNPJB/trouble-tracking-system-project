import React from 'react'
import ReactApexChart from 'react-apexcharts';

export const ChartForStatistic = ({ series, categories }) => {
const options = {
        chart: { 
            type: 'area', 
            height: 350,
            toolbar: { show: false },
            background: 'transparent',
            dropShadow: {
                enabled: true,
                top: 3,
                left: 2,
                blur: 4,
                opacity: 0.1
            },
            zoom: {
                enabled: false
            },
        },
        colors: ['#f50b0b', '#10B981'],       
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4, // ความเข้มด้านบน
                opacityTo: 0.5,  // ค่อยๆ จางลงด้านล่าง
                stops: [0, 90, 100]
            }
        },
        
        dataLabels: { enabled: false }, // ปิดตัวเลขบนเส้นกราฟให้ดูคลีนๆ
        
        stroke: {
            curve: 'smooth',
            width: [3, 3] ,
            colors: ['#f50b0b', '#10B981'],  
        },
    
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            offsetY: -20, // ขยับขึ้นนิดนึง
            markers: {
                radius: 12 // ทำให้จุดบอกสีกลมป๊อก
            }
        },

        xaxis: { 
            categories: categories, 
            labels: {
                style: { colors: '#64748b' } 
            }
        },
        yaxis: {
            labels: {
                style: { colors: '#64748b' } 
            }
        },
        
    };

    return (
        <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
        />
    );
}
