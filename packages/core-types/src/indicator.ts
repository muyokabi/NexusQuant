export interface PlotDefinition {
  name: string;
  type: "line" | "histogram" | "dot" | "bar";
  color: string;
}

export interface IndicatorDefinition {
  id: number;
  name: string;
  category: string;
  params: Record<string, any>;
  plots: PlotDefinition[];
}
