import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { Box } from '@mui/material';

const dummyData = [
  { id: "Group A", label: "Group A", value: 30, color: "hsl(123, 70%, 50%)" },
  { id: "Group B", label: "Group B", value: 50, color: "hsl(12, 70%, 50%)" },
  { id: "Group C", label: "Group C", value: 20, color: "hsl(240, 70%, 50%)" },
  { id: "Group D", label: "Group D", value: 40, color: "hsl(60, 70%, 50%)" },
  { id: "Group E", label: "Group E", value: 10, color: "hsl(300, 70%, 50%)" },
];

const PieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },  // Stack chart and legend on small screens, side by side on larger screens
        alignItems: 'center', // Center the chart and legend horizontally
        justifyContent: 'center',
        height: '100%', // Ensure the container takes full height
        marginTop: '20px',
      }}
    >
      <ResponsivePie
        data={dummyData}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: colors.grey[100],
              },
            },
            legend: {
              text: {
                fill: colors.grey[100],
              },
            },
            ticks: {
              line: {
                stroke: colors.grey[100],
                strokeWidth: 1,
              },
              text: {
                fill: colors.grey[100],
              },
            },
          },
          legends: {
            text: {
              fill: colors.grey[100],
            },
          },
        }}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        enableArcLabels={false}
        enableArcLinkLabels={false}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        legends={[
          {
            anchor: "start",
            direction: "column",
            justify: false,
            translateX: -78,
            translateY: 0,
            itemsSpacing: 5,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 10,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    </Box>
  );
};

export default PieChart;

// import { ResponsivePie } from "@nivo/pie";
// import { useTheme } from "@mui/material";

// const dummyData = [
//   { id: "Group A", label: "Group A", value: 30, color: "hsl(123, 70%, 50%)" },
//   { id: "Group B", label: "Group B", value: 50, color: "hsl(12, 70%, 50%)" },
//   { id: "Group C", label: "Group C", value: 20, color: "hsl(240, 70%, 50%)" },
//   { id: "Group D", label: "Group D", value: 40, color: "hsl(60, 70%, 50%)" },
//   { id: "Group E", label: "Group E", value: 10, color: "hsl(300, 70%, 50%)" },
// ];

// const PieChart = () => {
//   const theme = useTheme();

//   console.log("Rendering PieChart component");

//   return (
//     <ResponsivePie
//       data={dummyData}
//       margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
//       innerRadius={0.5}
//       padAngle={0.7}
//       cornerRadius={3}
//       activeOuterRadiusOffset={8}
//       borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      // enableArcLabels={false}
      // enableArcLinkLabels={false}
//       legends={[
//         {
//           anchor: "bottom", // Position the legend at the bottom of the chart
//           direction: "row", // Horizontal direction for the legend items
//           justify: false,
//           translateX: 0,
//           translateY: 56, // Position it slightly below the chart
//           itemsSpacing: 0,
//           itemWidth: 100,
//           itemHeight: 18,
//           itemDirection: "left-to-right",
//           symbolSize: 18,
//           symbolShape: "circle",
//           itemOpacity: 1,
//           onClick: (data) => console.log(data), // You can define any interaction here
//         },
//       ]}
//     />
//   );
// };

// export default PieChart;
