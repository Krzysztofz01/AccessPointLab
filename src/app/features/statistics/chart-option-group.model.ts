import { ChartConfiguration, ChartData, ChartType, Plugin } from "chart.js";

export interface ChartOptionGroup {
    options: ChartConfiguration['options'];
    type: ChartType;
    plugins: Array<Plugin>;
    data: ChartData;
}