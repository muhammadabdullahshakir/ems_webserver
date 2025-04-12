import * as React from 'react';
import { BarChart, BarLabel } from '@mui/x-charts/BarChart';
import { dataset, valueFormatter } from '../../data/ChartsData/CostData';
import { Height, Padding } from '@mui/icons-material';

const chartSetting = {
  xAxis: [
    {
      scaleType: 'band',  // Use 'band' scale for categorical data (month)
      dataKey: 'month',    // DataKey should be 'month' to match dataset
    },
  ],
  yAxis: [
    {
      scaleType: 'linear',  // Use 'linear' scale for numeric data (rainfall in mm)
      label: 'Cost (PKR)',   // Label for y-axis
     
    },
  ],
  width:500,
height:400
};

export default function CostBarGraph() {
  return (
     <BarChart
      sx={{ width: '100%' }}
      dataset={dataset}
      series={[
        {
          dataKey: 'seoul',
          label: 'Costing',
          valueFormatter,
          color: '#0C101B',  // Set the bar color here
        },
      ]}
      layout="vertical"  // Set layout to vertical
      {...chartSetting}   // Apply chart settings
    />
  );
}
