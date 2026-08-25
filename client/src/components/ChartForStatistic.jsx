import React from 'react'
import ReactApexChart from 'react-apexcharts';

export const ChartForStatistic = ({ series, categories }) => {
    const options = {
        chart: {
            width: '100%',
            type: 'bar', // 👈 เปลี่ยนเป็น bar
            toolbar: { show: false }
        },
        colors: ['#008FFB', '#00E396', '#FF4560'],
        plotOptions: {
            bar: {
                horizontal: false,  // false = กราฟแนวตั้ง (ถ้าอยากได้แนวนอนเปลี่ยนเป็น true)
                columnWidth: '55%', // ความกว้างของแท่งกราฟ
                borderRadius: 4,    // ลบมุมแท่งกราฟให้มนๆ ดูทันสมัยขึ้น
            },
        },
        dataLabels: { 
            enabled: false // ปิดตัวเลขบนแท่ง
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'] // เว้นระยะห่างระหว่างแท่งสีแดงกับเขียว
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
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            offsetY: -10,
            markers: {
                radius: 12 
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " รายการ" 
                }
            }
        }
    };

    return (
        <ReactApexChart
            options={options}
            series={series}
            type="bar" 
            height={350}
        />
    );
}
