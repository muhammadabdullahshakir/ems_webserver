import { Box, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import GraphCard from './GraphCard';

const GraphContainer = () => {
  const [solarValues, setSolarValues] = useState([]);

  useEffect(() => {
    const fetchSolarData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/power-data/?gateway_id=1");
        const json = await res.json();
        const values = json.data.map(item => item.total_solar).slice(0, 7);
        setSolarValues(values);
      } catch (err) {
        console.error("Error fetching solar data:", err);
      }
    };

    fetchSolarData();
  }, []);

  const graphDataArray = [
    {
      title: 'Total Solar usage',
      caption: 'Sum of solar usage of all projects',
      bg: 'linear-gradient(to top,rgb(31,31,32), rgb(59,59,66))',
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: solarValues.length ? solarValues : [0, 0, 0, 0, 0, 0, 0], // fallback while loading
      }
    },
    {
      title: 'Total Grid In',
      caption: 'Sum of grid in of all projects',
      bg: 'linear-gradient(to top,rgb(34,123,233),rgb(66,156,239))',
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [15, 25, 18, 32, 28, 20, 35]
      }
    },
    {
      title: 'Total Grid Out',
      caption: 'Sum of grid out of all projects',
      bg: 'linear-gradient(to top,rgb(72,164,76),rgb(96,183,100))',
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [5, 10, 15, 12, 18, 16, 22]
      }
    },
    {
      title: 'Total Cost',
      caption: 'Sum of cost of all projects',
      bg: 'linear-gradient(to top,rgb(233,59,118),rgb(218,32,99))',
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [1000, 950, 1020, 980, 1050, 1100, 1150]
      }
    },
  ];

  return (
    <Grid
      container
      spacing={2}
      sx={{
        pt: 2,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}
    >
      {graphDataArray.map((card, index) => (
        <Grid
          key={index}
          item
          xs={12}
          sm={6}
          md={3}
          sx={{
            flexGrow: 1,
            minWidth: '250px',
          }}
        >
          <GraphCard
            title={card.title}
            subTitle={''}
            caption={card.caption}
            gradientGraphbg={card.bg}
            graphData={card.data}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default GraphContainer;
