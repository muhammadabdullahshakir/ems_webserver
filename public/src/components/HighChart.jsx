import React, { useEffect, useRef } from 'react';
import Highcharts, { color } from 'highcharts';
import HighchartsStock from 'highcharts/modules/stock';
import HighchartsReact from 'highcharts-react-official';

HighchartsStock(Highcharts); // Initialize the Highcharts Stock module

const HighChart = ({ title, data }) => {
  const chartRef = useRef(null); // Reference to the HighchartsReact component

  const options = {
    title: {
      text: title,
      style:{
        color : '#000'
      }
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Time',
        style:{
          color : '#000'
        }
      },
      // You can set minRange here if needed
    },
    yAxis: {
      title: {
        text: 'Value',
      },
    },
    series: data.map((item) => ({
      name: item.name,
      data: item.data,
      tooltip: {
        valueDecimals: 2,
      },
    })),
    plotOptions: {
      series: {
        marker: {
          enabled: true,
        },
      },
    },
    chart: {
      zoomType: 'x',
      // backgroundColor :'#1F2A40'
    },
    navigator: {
      enabled: true,
      adaptToUpdatedData: false, // Keep navigator static unless updated
    },
    credits: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
    },
  };

  // Effect to update data without affecting zoom/navigator
  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;

      data.forEach((item, index) => {
        if (chart.series[index]) {
          // Update existing series data
          chart.series[index].setData(item.data, false); // false to defer redraw
        } else {
          // Add new series if it doesn't exist
          chart.addSeries(
            {
              name: item.name,
              data: item.data,
              tooltip: {
                valueDecimals: 2,
              },
            },
            false // false to defer redraw
          );
        }
      });

      chart.redraw(); // Redraw chart after updating series
    }
  }, [data]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType={'stockChart'}
      options={options}
      ref={chartRef} // Attach ref to access the chart instance
    />
  );
};

export default HighChart;
