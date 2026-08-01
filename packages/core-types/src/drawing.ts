export interface Point {
  x: number;
  y: number;
}

export interface DrawingProperties {
  color: string;
  lineWidth: number;
  fillColor?: string;
  font?: string;
}

export interface DrawingState {
  id: string;
  type: string;
  points: Point[];
  selected: boolean;
  style: DrawingProperties;
}
