export interface DataType {
  [key: string]: number | string;
  name: string;
}

export interface LineAriaChartPropsType {
  width: number;
  height: number;
  data: DataType[];
  legend?: string;
  tooltipUnit?: string;
  colors?: {
    [key: string]: string;
  };
}
