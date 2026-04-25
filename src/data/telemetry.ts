export type Severity = "ok" | "warning" | "critical";
export type MetricKey = "prbUtilization" | "dropRate" | "latency";
export type ElementType = "cell" | "sector" | "aggregation" | "backhaul" | "core";

export type ClusterHealth = {
  availability: number;
  activeCells: number;
  impactedUes: number;
  throughputCurrentGbps: number;
  throughputBaselineGbps: number;
  prbP95: number;
};

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  unit: string;
  buckets: string[];
  thresholds: {
    greenMax: number;
    yellowMax: number;
  };
};

export type CellSector = {
  id: string;
  name: string;
  region: string;
  tech: "4G" | "5G";
  sector: string;
  x: number;
  y: number;
  polygon: string;
  prbUtilization: number;
  dropRate: number;
  latency: number;
  impactedUes: number;
  enterpriseSite?: string;
};

export type TimeSeriesPoint = {
  time: string;
  prb: Record<string, number>;
  throughputMbps: number;
  dropRate: number;
  latency: number;
};

export type ChangeEvent = {
  id: string;
  label: string;
  start: string;
  end: string;
};

export type TopologyNode = {
  id: string;
  label: string;
  type: ElementType;
  severity: Severity;
  x: number;
  y: number;
};

export type TopologyEdge = {
  id: string;
  source: string;
  target: string;
  traffic: "normal" | "high" | "saturated";
  packetLoss: number;
};

export type AnomalyRow = {
  id: string;
  elementId: string;
  region: string;
  tech: "4G" | "5G" | "IP";
  utilization: number;
  latency: number;
  dropRate: number;
  anomalyScore: number;
  sparkline: number[];
};

export type IncidentAlert = {
  id: string;
  time: string;
  severity: Severity;
  impactedElement: string;
  description: string;
  status: "new" | "ack" | "resolved";
  elementId: string;
  topologyPath: string[];
  window: {
    start: string;
    end: string;
  };
};

export const clusterHealth: ClusterHealth = {
  availability: 98.72,
  activeCells: 42,
  impactedUes: 12400,
  throughputCurrentGbps: 18.4,
  throughputBaselineGbps: 26.1,
  prbP95: 91.6,
};

export const metricDefinitions: Record<MetricKey, MetricDefinition> = {
  prbUtilization: {
    key: "prbUtilization",
    label: "PRB utilization",
    unit: "%",
    buckets: ["<70", "70-78", "78-85", "85-91", ">91"],
    thresholds: { greenMax: 70, yellowMax: 85 },
  },
  dropRate: {
    key: "dropRate",
    label: "Drop rate",
    unit: "%",
    buckets: ["<1", "1-2", "2-3", "3-4", ">4"],
    thresholds: { greenMax: 1, yellowMax: 3 },
  },
  latency: {
    key: "latency",
    label: "Latency",
    unit: "ms",
    buckets: ["<40", "40-55", "55-80", "80-105", ">105"],
    thresholds: { greenMax: 40, yellowMax: 80 },
  },
};

export const cells: CellSector[] = [
  {
    id: "CBD-E-01A",
    name: "CBD-East 01A",
    region: "CBD-East",
    tech: "5G",
    sector: "A",
    x: 69,
    y: 30,
    polygon: "64,18 82,23 79,41 61,38",
    prbUtilization: 94.2,
    dropRate: 4.8,
    latency: 112,
    impactedUes: 3900,
    enterpriseSite: "Exchange Tower",
  },
  {
    id: "CBD-E-01B",
    name: "CBD-East 01B",
    region: "CBD-East",
    tech: "5G",
    sector: "B",
    x: 57,
    y: 43,
    polygon: "49,32 65,38 60,56 43,50",
    prbUtilization: 91.7,
    dropRate: 3.9,
    latency: 96,
    impactedUes: 3100,
    enterpriseSite: "Market Hall HQ",
  },
  {
    id: "CBD-E-02C",
    name: "CBD-East 02C",
    region: "CBD-East",
    tech: "5G",
    sector: "C",
    x: 73,
    y: 56,
    polygon: "66,45 83,48 84,68 66,70",
    prbUtilization: 88.9,
    dropRate: 3.2,
    latency: 84,
    impactedUes: 2200,
  },
  {
    id: "CBD-N-03A",
    name: "CBD-North 03A",
    region: "CBD-North",
    tech: "5G",
    sector: "A",
    x: 37,
    y: 24,
    polygon: "29,14 46,14 50,31 33,36",
    prbUtilization: 76.4,
    dropRate: 1.8,
    latency: 56,
    impactedUes: 850,
  },
  {
    id: "CBD-C-04B",
    name: "CBD-Central 04B",
    region: "CBD-Central",
    tech: "4G",
    sector: "B",
    x: 42,
    y: 63,
    polygon: "33,55 49,50 56,68 39,78",
    prbUtilization: 68.3,
    dropRate: 0.8,
    latency: 34,
    impactedUes: 360,
    enterpriseSite: "Civic Bank",
  },
  {
    id: "CBD-W-05A",
    name: "CBD-West 05A",
    region: "CBD-West",
    tech: "5G",
    sector: "A",
    x: 21,
    y: 50,
    polygon: "12,39 28,36 34,55 18,64",
    prbUtilization: 61.1,
    dropRate: 0.6,
    latency: 29,
    impactedUes: 190,
  },
];

export const series: TimeSeriesPoint[] = [
  { time: "13:50", prb: { "CBD-E-01A": 64, "CBD-E-01B": 58, "CBD-E-02C": 55, "CBD-N-03A": 48, "CBD-C-04B": 44, "CBD-W-05A": 39 }, throughputMbps: 71, dropRate: 0.7, latency: 32 },
  { time: "14:00", prb: { "CBD-E-01A": 67, "CBD-E-01B": 61, "CBD-E-02C": 58, "CBD-N-03A": 51, "CBD-C-04B": 46, "CBD-W-05A": 40 }, throughputMbps: 69, dropRate: 0.8, latency: 34 },
  { time: "14:10", prb: { "CBD-E-01A": 73, "CBD-E-01B": 66, "CBD-E-02C": 62, "CBD-N-03A": 54, "CBD-C-04B": 47, "CBD-W-05A": 41 }, throughputMbps: 65, dropRate: 1.1, latency: 39 },
  { time: "14:20", prb: { "CBD-E-01A": 84, "CBD-E-01B": 76, "CBD-E-02C": 69, "CBD-N-03A": 59, "CBD-C-04B": 51, "CBD-W-05A": 43 }, throughputMbps: 57, dropRate: 1.9, latency: 53 },
  { time: "14:30", prb: { "CBD-E-01A": 92, "CBD-E-01B": 86, "CBD-E-02C": 79, "CBD-N-03A": 66, "CBD-C-04B": 56, "CBD-W-05A": 45 }, throughputMbps: 42, dropRate: 3.4, latency: 86 },
  { time: "14:40", prb: { "CBD-E-01A": 96, "CBD-E-01B": 92, "CBD-E-02C": 87, "CBD-N-03A": 73, "CBD-C-04B": 63, "CBD-W-05A": 48 }, throughputMbps: 36, dropRate: 4.8, latency: 111 },
  { time: "14:50", prb: { "CBD-E-01A": 91, "CBD-E-01B": 89, "CBD-E-02C": 83, "CBD-N-03A": 76, "CBD-C-04B": 66, "CBD-W-05A": 50 }, throughputMbps: 44, dropRate: 3.7, latency: 93 },
  { time: "15:00", prb: { "CBD-E-01A": 86, "CBD-E-01B": 82, "CBD-E-02C": 78, "CBD-N-03A": 70, "CBD-C-04B": 61, "CBD-W-05A": 48 }, throughputMbps: 52, dropRate: 2.6, latency: 69 },
  { time: "15:10", prb: { "CBD-E-01A": 79, "CBD-E-01B": 75, "CBD-E-02C": 72, "CBD-N-03A": 62, "CBD-C-04B": 55, "CBD-W-05A": 43 }, throughputMbps: 61, dropRate: 1.5, latency: 47 },
];

export const changeEvents: ChangeEvent[] = [
  { id: "chg-0221", label: "QoS policy push", start: "14:12", end: "14:18" },
  { id: "mnt-agg02", label: "AGG-02 optics maintenance", start: "14:28", end: "14:45" },
];

export const topologyNodes: TopologyNode[] = [
  { id: "CBD-E-01A", label: "01A", type: "cell", severity: "critical", x: 8, y: 26 },
  { id: "CBD-E-01B", label: "01B", type: "cell", severity: "critical", x: 8, y: 50 },
  { id: "CBD-E-02C", label: "02C", type: "cell", severity: "warning", x: 8, y: 74 },
  { id: "AGG-02", label: "AGG-02", type: "aggregation", severity: "critical", x: 38, y: 50 },
  { id: "BH-17", label: "BH-17", type: "backhaul", severity: "critical", x: 64, y: 50 },
  { id: "CORE-1", label: "CORE-1", type: "core", severity: "warning", x: 90, y: 50 },
];

export const topologyEdges: TopologyEdge[] = [
  { id: "e1", source: "CBD-E-01A", target: "AGG-02", traffic: "saturated", packetLoss: 2.6 },
  { id: "e2", source: "CBD-E-01B", target: "AGG-02", traffic: "saturated", packetLoss: 2.1 },
  { id: "e3", source: "CBD-E-02C", target: "AGG-02", traffic: "high", packetLoss: 1.4 },
  { id: "e4", source: "AGG-02", target: "BH-17", traffic: "saturated", packetLoss: 3.8 },
  { id: "e5", source: "BH-17", target: "CORE-1", traffic: "high", packetLoss: 1.9 },
];

export const anomalyRows: AnomalyRow[] = [
  { id: "row-01", elementId: "CBD-E-01A", region: "CBD-East", tech: "5G", utilization: 94.2, latency: 112, dropRate: 4.8, anomalyScore: 98, sparkline: [42, 44, 47, 53, 61, 74, 88, 94] },
  { id: "row-02", elementId: "AGG-02", region: "CBD-East", tech: "IP", utilization: 93.5, latency: 118, dropRate: 3.8, anomalyScore: 95, sparkline: [40, 43, 46, 51, 68, 84, 92, 96] },
  { id: "row-03", elementId: "CBD-E-01B", region: "CBD-East", tech: "5G", utilization: 91.7, latency: 96, dropRate: 3.9, anomalyScore: 91, sparkline: [38, 42, 43, 50, 60, 75, 86, 92] },
  { id: "row-04", elementId: "BH-17", region: "Metro Ring", tech: "IP", utilization: 89.8, latency: 102, dropRate: 3.1, anomalyScore: 87, sparkline: [35, 39, 42, 48, 57, 78, 88, 90] },
  { id: "row-05", elementId: "CBD-E-02C", region: "CBD-East", tech: "5G", utilization: 88.9, latency: 84, dropRate: 3.2, anomalyScore: 82, sparkline: [34, 37, 41, 48, 56, 71, 81, 89] },
  { id: "row-06", elementId: "CBD-N-03A", region: "CBD-North", tech: "5G", utilization: 76.4, latency: 56, dropRate: 1.8, anomalyScore: 61, sparkline: [28, 31, 36, 39, 44, 55, 70, 76] },
  { id: "row-07", elementId: "CBD-C-04B", region: "CBD-Central", tech: "4G", utilization: 68.3, latency: 34, dropRate: 0.8, anomalyScore: 34, sparkline: [26, 27, 31, 35, 39, 47, 58, 68] },
];

export const alerts: IncidentAlert[] = [
  {
    id: "alert-001",
    time: "14:45",
    severity: "critical",
    impactedElement: "CBD-E-01A",
    description: "PRB P95 >91% with 4.8% session drops; correlated AGG-02 loss.",
    status: "new",
    elementId: "CBD-E-01A",
    topologyPath: ["CBD-E-01A", "AGG-02", "BH-17", "CORE-1"],
    window: { start: "14:20", end: "14:45" },
  },
  {
    id: "alert-002",
    time: "14:42",
    severity: "critical",
    impactedElement: "AGG-02 -> CORE-1",
    description: "Backhaul loss rose above 3% during optics maintenance window.",
    status: "ack",
    elementId: "AGG-02",
    topologyPath: ["AGG-02", "BH-17", "CORE-1"],
    window: { start: "14:28", end: "14:45" },
  },
  {
    id: "alert-003",
    time: "14:36",
    severity: "warning",
    impactedElement: "CBD-E-02C",
    description: "Latency crossed 80ms while PRB utilization remained >85%.",
    status: "ack",
    elementId: "CBD-E-02C",
    topologyPath: ["CBD-E-02C", "AGG-02", "BH-17"],
    window: { start: "14:30", end: "14:50" },
  },
  {
    id: "alert-004",
    time: "14:18",
    severity: "warning",
    impactedElement: "CBD-N-03A",
    description: "North spillover began after QoS policy push.",
    status: "resolved",
    elementId: "CBD-N-03A",
    topologyPath: ["CBD-N-03A", "AGG-02"],
    window: { start: "14:12", end: "14:25" },
  },
];

export function severityForMetric(metric: MetricKey, value: number): Severity {
  const thresholds = metricDefinitions[metric].thresholds;
  if (value < thresholds.greenMax) return "ok";
  if (value <= thresholds.yellowMax) return "warning";
  return "critical";
}

export function formatMetric(metric: MetricKey, value: number) {
  const definition = metricDefinitions[metric];
  return `${value.toFixed(metric === "latency" ? 0 : 1)}${definition.unit}`;
}
