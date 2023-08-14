import React from "react";

const GAUGE_RADIUS = 40;
const GAUGE_WIDTH = 6;
const SEGMENT_WIDTH = 12;
const SVG_SIZE = 94;
const ARC_START_ANGLE = -155;
const ARC_END_ANGLE = 155;
const TICK_LENGTH = 2;

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const ROTATION_ANGLE = 0;

  // Adjust the control points for a rounder arc on the right side
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    ROTATION_ANGLE,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
  return d;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  return {
    x: centerX + radius * Math.cos(angleInDegreesToRadians(angleInDegrees)),
    y: centerY + radius * Math.sin(angleInDegreesToRadians(angleInDegrees)),
  };
}

const angleInDegreesToRadians = (angleInDegrees: number) =>
  ((angleInDegrees - 90) * Math.PI) / 180.0;

const getTickPositions = (segmentsAmount: number): number[] => {
  const multiplier = 100 / segmentsAmount;

  return Array.from(
    { length: segmentsAmount - 1 },
    (v, i) => (i + 1) * multiplier
  );
};

const arcPath = (startAngle: number, endAngle: number) =>
  describeArc(SVG_SIZE / 2, SVG_SIZE / 2, GAUGE_RADIUS, startAngle, endAngle);

const arcLength = (radius: number, startAngle: number, endAngle: number) => {
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;

  return radius * (endAngleRad - startAngleRad);
};

type GaugeProps = {
  value: number;
  segments: number;
  color: string;
};

const Root = ({ children }: { children?: React.ReactNode }) => (
  <svg
    width={SVG_SIZE}
    height={SVG_SIZE}
    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
  >
    {children}
  </svg>
);

const ArcBackground = ({ children }: { children?: React.ReactNode }) => (
  <path
    fill="none"
    className="stroke-slate-100"
    strokeWidth={GAUGE_WIDTH}
    strokeLinecap="round"
    d={arcPath(ARC_START_ANGLE, ARC_END_ANGLE)}
  >
    {children}
  </path>
);

const ArcFiller = ({ value, color }: { value: number; color: string }) => {
  const startAngle = ARC_START_ANGLE;
  const endAngle = value * Math.PI - ARC_END_ANGLE - GAUGE_WIDTH / 2;

  const dashLength = arcLength(GAUGE_RADIUS, startAngle, endAngle);

  return (
    <path
      fill="none"
      className={color}
      strokeWidth={GAUGE_WIDTH}
      strokeLinecap="round"
      strokeDasharray={dashLength}
      d={arcPath(ARC_START_ANGLE, endAngle)}
    >
      <animate
        attributeName="stroke-dashoffset"
        from={dashLength}
        to={dashLength * 2}
        dur="3s"
      />
    </path>
  );
};

const ArcTick = ({ value }: { value: number }) => {
  return (
    <path
      className="stroke-white"
      strokeWidth={SEGMENT_WIDTH}
      d={arcPath(
        (value - TICK_LENGTH) * Math.PI - ARC_END_ANGLE,
        value * Math.PI - ARC_END_ANGLE
      )}
    />
  );
};

type ArcSegmentProps = {
  start: number;
  end: number;
  rounded?: boolean;
  color: string;
};

const ArcSegment = ({ start, end, rounded, color }: ArcSegmentProps) => {
  return (
    <path
      fill="none"
      className={`${color} transition-all ease-in-out duration-300 opacity-0 hover:opacity-25`}
      strokeLinecap={rounded ? "round" : "butt"}
      strokeWidth={SEGMENT_WIDTH}
      d={arcPath(
        start * Math.PI - ARC_END_ANGLE,
        end * Math.PI - ARC_END_ANGLE
      )}
    />
  );
};

const Gauge = ({ value, segments, color }: GaugeProps) => {
  const tickPositions = getTickPositions(segments);

  return (
    <div className="flex justify-center ">
      <Root>
        <ArcBackground />
        <ArcFiller value={value} color={color} />

        {tickPositions.map((position, index) => (
          <>
            {index === 0 ? (
              <ArcSegment
                start={0}
                end={tickPositions[0] - TICK_LENGTH}
                rounded={true}
                color={color}
              />
            ) : (
              <ArcSegment
                key={position}
                start={tickPositions[index - 1] - TICK_LENGTH}
                end={position - TICK_LENGTH}
                color={color}
              />
            )}
          </>
        ))}
        <ArcSegment
          start={(tickPositions.at(-1) || 0) + TICK_LENGTH / 2}
          end={100 - TICK_LENGTH / 2}
          rounded={true}
          color={color}
        />

        {tickPositions.map((position) => (
          <ArcTick value={position} key={position} />
        ))}
      </Root>
    </div>
  );
};

export default Gauge;
