import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Legend,
} from "recharts";
import styles from "./LineAria.module.scss";
import { LineAriaChartPropsType } from "./types";

export default function LineAriaChart({
  data,
  width,
  height,
  legend,
  colors,
  tooltipUnit,
}: LineAriaChartPropsType) {
  return (
    <ComposedChart
      width={width}
      height={height}
      className={styles.lineAria}
      data={data}
      margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
    >
      <CartesianGrid vertical={false} stroke="var(--chartLines)" />
      <XAxis dataKey="name" stroke="var(--inputColor0)" />
      <YAxis stroke="var(--inputColor0)" />
      <Tooltip
        wrapperStyle={{ fontSize: 12 }}
        contentStyle={{
          margin: 20,
          backgroundColor: " var(--boxBg0Hover)",
          border: "1px solid var(--inputBorder0)",
          borderRadius: 8,
          padding: 15,
          color: "var(--color0)",
        }}
        itemStyle={{ fontSize: 12, margin: 0, padding: "5px 0 0  0" }}
        labelStyle={{ marginBottom: 10 }}
        formatter={(value: number, name: string) =>
          [`${value}${tooltipUnit ? ` ${tooltipUnit}` : ""}`, name] as any
        }
        label=""
        labelFormatter={(name) => <strong>{name}</strong>}
      />
      {!!legend && (
        <Legend
          wrapperStyle={{ bottom: 10, left: 10 }}
          content={() => legend}
        />
      )}
      {data.length &&
        Object.keys(data[0])
          .filter((x) => x !== "name")
          .map((key, k: number) => (
            <React.Fragment key={`chart-l${k}`}>
              <Line
                type="monotone"
                dataKey={key}
                stroke={colors ? colors[key] : `var(--opt${k})`}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                activeDot={false}
                dataKey={key}
                fill={colors ? colors[key] : `var(--opt${k})`}
                stroke="none"
                tooltipType={"none"}
                fillOpacity={0.5}
              />
            </React.Fragment>
          ))}
    </ComposedChart>
  );
}
