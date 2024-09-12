import React, { useRef, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsStock from 'highcharts/modules/stock';


HighchartsStock(Highcharts);

const HighChart = ({ title, data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = chartRef.current.chart;

    if (chart) {
      data.forEach((seriesData, index) => {
        const series = chart.series[index];
        if (series) {
          series.setData(seriesData.data, false); 
        }
      });

      chart.redraw(); 
    }
  }, [data]);

  return (
    <div style={{ width: '100%', height: '500px', margin: '0 auto'}}>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        ref={chartRef}
        options={{
          
          navigator: {
            enabled: true,
            height: 40,
            margin: 10,
            maskFill: 'rgba(102, 133, 194, 0.2)'
          },
          title: {
            text: title
          },
          xAxis: {
            type: 'datetime',
            title: {
              text: 'Time'
            }
          },
          yAxis: {
            title: {
              text: 'Value'
            }
          },
          series: data.map((item) => ({
            name: item.name,
            data: item.data,
            tooltip: {
              valueDecimals: 2
            }
          })),
          plotOptions: {
            series: {
              marker: {
                enabled: true
              }
            }
          },
          legend: {
            enabled: true,
            reversed: true,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: {
              color: '#333333',
              fontWeight: 'bold'
            }
          },
          chart: {
            zoomType: 'x'
            
          },
          credits: {
            enabled: false
          }
        }}
      />
    </div>
  );
};

export default HighChart;
