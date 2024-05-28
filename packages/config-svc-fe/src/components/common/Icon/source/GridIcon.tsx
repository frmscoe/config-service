import React from "react";

export const GridIcon = ({
  width = "40",
  height = "40",
  strokeColor = "currentColor",
  strokeWidth = "2",
  borderRadius = "3",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 50 50"
    width={width}
    height={height}
    {...props}
  >
    <g stroke={strokeColor} strokeWidth={strokeWidth} fill="none">
      <rect x="5" y="5" width="15" height="15" rx={borderRadius} ry={borderRadius} />
      <rect x="5" y="30" width="15" height="15" rx={borderRadius} ry={borderRadius} />
      <rect x="30" y="5" width="15" height="15" rx={borderRadius} ry={borderRadius} />
      <rect x="30" y="30" width="15" height="15" rx={borderRadius} ry={borderRadius} />
    </g>
  </svg>
);
