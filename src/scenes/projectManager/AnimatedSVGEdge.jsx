// import React from 'react';

// function AnimatedSVGEdge({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
// }) {
//   return (
//     <svg style={{ overflow: 'visible', position: 'absolute' }}>
//       <line
//         id={id}
//         x1={sourceX}
//         y1={sourceY}
//         x2={targetX}
//         y2={targetY}
//         stroke="black"
//         strokeWidth={2}
//         strokeDasharray="5,5"
//         style={{
//           animation: 'dash-animation 1s linear infinite', 
//             stroke: "#4cceac",

//         }}
//       />
//       <style>
//         {`
//           @keyframes dash-animation {
//             from {
//               stroke-dashoffset: 0;
//             }
//             to {
//               stroke-dashoffset: -10;
//             }
//           }
//         `}
//       </style>
//     </svg>
//   );
// }

// export default AnimatedSVGEdge;
import React from 'react';
import { BaseEdge, getSmoothStepPath, getBezierPath} from '@xyflow/react';
function AnimatedSVGEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <circle r="10" fill="#3da58a">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}

export default AnimatedSVGEdge;