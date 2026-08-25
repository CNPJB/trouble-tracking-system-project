import React from 'react';
import ReactApexChart from 'react-apexcharts';

export const PieChartStatus = ({ series, labels }) => {
    const options = {
        chart: {
            type: 'donut', // เปลี่ยนเป็น 'pie' ได้ถ้าไม่ชอบแบบมีรูตรงกลาง
            fontFamily: 'inherit'
        },
        labels: labels,
        colors: ['#FEB019', '#00E396', '#FF4560'], // เหลือง(รอดำเนินการ), เขียว(เสร็จ), แดง(ปฏิเสธ)
        legend: {
            position: 'bottom'
        },
        dataLabels: {
            enabled: true,
            formatter: function (val, opts) {
                // โชว์เป็นจำนวนตั๋ว แทนเปอร์เซ็นต์
                return opts.w.globals.seriesTotals[opts.seriesIndex] + " รายการ"
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: { show: true },
                        value: { show: true },
                        total: {
                            show: true,
                            label: 'ปัญหารวม',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        }
    };

    return (
        <div id="pie-chart">
            <ReactApexChart options={options} series={series} type="donut" height={350} />
        </div>
    );
};