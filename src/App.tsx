import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Gauge,
  Map,
  Network,
  RadioTower,
  RotateCcw,
  SignalHigh,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { Tooltip } from "./components/ui/tooltip";
import {
  alerts,
  anomalyRows,
  cells,
  changeEvents,
  clusterHealth,
  formatMetric,
  metricDefinitions,
  series,
  severityForMetric,
  topologyEdges,
  topologyNodes,
  type CellSector,
  type IncidentAlert,
  type MetricKey,
  type Severity,
} from "./data/telemetry";
import { cn } from "./lib/utils";

const orderedMetrics: MetricKey[] = ["prbUtilization", "dropRate", "latency"];
const focusFallbackCell = "CBD-E-01A";

export function App() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("prbUtilization");
  const [focusedAlertId, setFocusedAlertId] = useState(alerts[0].id);
  const focusedAlert = alerts.find((alert) => alert.id === focusedAlertId) ?? null;
  const focusedCellId = focusedAlert ? getFocusedCellId(focusedAlert) : null;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">5G cluster congestion command view</p>
          <h1>CBD-East cell cluster</h1>
        </div>
        <div className="header-meta">
          <Badge variant="critical">Live incident</Badge>
          <span>Last PM ingest 15:12 CET</span>
        </div>
      </header>

      <section className="hero-row">
        <IncidentBanner />
        <HealthStrip />
      </section>

      <TimeSeriesWall focusedAlert={focusedAlert} />

      <section className="map-topology-grid">
        <GeoHeatmap selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} focusedCellId={focusedCellId} />
        <TopologyView focusedAlert={focusedAlert} />
      </section>

      <section className="alert-table-grid">
        <AlertFeed focusedAlertId={focusedAlertId} onSelect={setFocusedAlertId} onClear={() => setFocusedAlertId("")} />
        <AnomalyTable focusedAlert={focusedAlert} />
      </section>
    </main>
  );
}

function IncidentBanner() {
  return (
    <Alert variant="critical" className="incident-banner">
      <AlertTriangle data-icon="inline-start" />
      <div>
        <AlertTitle>Critical congestion detected in CBD-East sector group</AlertTitle>
        <AlertDescription>
          PRB utilization exceeded 91% from 14:20-14:45, affecting 12.4k UEs. Drop rate and latency degradation
          correlate with backhaul loss on AGG-02 -&gt; CORE-1.
        </AlertDescription>
      </div>
      <Badge variant="critical" className="incident-badge">
        Bottleneck likely transport
      </Badge>
    </Alert>
  );
}

function HealthStrip() {
  const throughputDelta =
    ((clusterHealth.throughputCurrentGbps - clusterHealth.throughputBaselineGbps) / clusterHealth.throughputBaselineGbps) *
    100;

  return (
    <section className="health-strip" aria-label="Cluster health summary">
      <StatTile
        icon={<SignalHigh data-icon="inline-start" />}
        label="Cluster Availability"
        value={`${clusterHealth.availability.toFixed(2)}%`}
        detail="15 min rolling"
        severity="warning"
      />
      <StatTile
        icon={<RadioTower data-icon="inline-start" />}
        label="Active Cells"
        value={`${clusterHealth.activeCells}/44`}
        detail="2 cells degraded"
        severity="warning"
      />
      <StatTile
        icon={<Activity data-icon="inline-start" />}
        label="Impacted UEs"
        value={`${(clusterHealth.impactedUes / 1000).toFixed(1)}k`}
        detail="CBD-East slice"
        severity="critical"
      />
      <StatTile
        icon={<Zap data-icon="inline-start" />}
        label="Throughput vs Baseline"
        value={`${clusterHealth.throughputCurrentGbps.toFixed(1)} Gbps`}
        detail={`${throughputDelta.toFixed(0)}% below baseline`}
        severity="critical"
      />
      <Card className="gauge-card">
        <CardHeader>
          <CardTitle>
            <Gauge data-icon="inline-start" />
            Cell PRB Utilization
          </CardTitle>
          <CardDescription>P95 last 15 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <GaugeDial value={clusterHealth.prbP95} />
        </CardContent>
      </Card>
    </section>
  );
}

function StatTile({
  icon,
  label,
  value,
  detail,
  severity,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  severity: Severity;
}) {
  return (
    <Card className={cn("stat-card", `severity-${severity}`)}>
      <CardHeader>
        <CardTitle>
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="stat-value">{value}</div>
        <p>{detail}</p>
      </CardContent>
    </Card>
  );
}

function GaugeDial({ value }: { value: number }) {
  const angle = -130 + (Math.min(value, 100) / 100) * 260;
  const severity = severityForMetric("prbUtilization", value);

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 160 92" className="gauge-svg" aria-label={`PRB P95 ${value.toFixed(1)} percent`}>
        <path className="gauge-track" d="M22 80 A58 58 0 0 1 138 80" />
        <path className="gauge-ok" d="M22 80 A58 58 0 0 1 72 24" />
        <path className="gauge-warning" d="M72 24 A58 58 0 0 1 113 34" />
        <path className="gauge-critical" d="M113 34 A58 58 0 0 1 138 80" />
        <line
          className={cn("gauge-needle", `stroke-${severity}`)}
          x1="80"
          y1="80"
          x2="80"
          y2="28"
          transform={`rotate(${angle} 80 80)`}
        />
        <circle cx="80" cy="80" r="5" className="gauge-hub" />
      </svg>
      <div>
        <strong>{value.toFixed(1)}%</strong>
        <Badge variant={severity}>{severity}</Badge>
      </div>
    </div>
  );
}

function TimeSeriesWall({ focusedAlert }: { focusedAlert: IncidentAlert | null }) {
  return (
    <Card className="time-wall">
      <CardHeader>
        <div>
          <CardTitle>
            <Activity data-icon="inline-start" />
            Capacity and QoE timeline
          </CardTitle>
          <CardDescription>Shared incident axis with config changes, maintenance bands, and selected alert focus.</CardDescription>
        </div>
        {focusedAlert ? (
          <Badge variant={focusedAlert.severity}>
            Focus {focusedAlert.window.start}-{focusedAlert.window.end}
          </Badge>
        ) : (
          <Badge variant="outline">No alert focus</Badge>
        )}
      </CardHeader>
      <CardContent className="chart-grid">
        <PrbChart focusedAlert={focusedAlert} />
        <QoeChart focusedAlert={focusedAlert} />
      </CardContent>
    </Card>
  );
}

function PrbChart({ focusedAlert }: { focusedAlert: IncidentAlert | null }) {
  const topCells = useMemo(() => {
    return [...cells].sort((a, b) => b.prbUtilization - a.prbUtilization).slice(0, 3);
  }, []);

  return (
    <div className="chart-panel">
      <div className="panel-title-row">
        <h3>PRB Utilization by Cell Group</h3>
        <span>Top 3 emphasized</span>
      </div>
      <svg viewBox="0 0 820 260" className="line-chart" role="img" aria-label="PRB utilization by cell group">
        <ChartGrid />
        <ChangeBands focusedAlert={focusedAlert} />
        <ThresholdLine value={85} max={100} label="85% PRB red threshold" />
        {cells.map((cell) => {
          const isTop = topCells.some((top) => top.id === cell.id);
          const points = series.map((point, index) => ({
            x: chartX(index),
            y: chartY(point.prb[cell.id], 100),
          }));
          return (
            <path
              key={cell.id}
              className={cn("chart-line", isTop ? `cell-line-${topCells.findIndex((top) => top.id === cell.id)}` : "cell-line-muted")}
              d={linePath(points)}
            />
          );
        })}
        <AxisLabels />
      </svg>
      <div className="legend-row">
        {topCells.map((cell, index) => (
          <span key={cell.id} className={`legend-item cell-legend-${index}`}>
            {cell.id} {cell.prbUtilization.toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function QoeChart({ focusedAlert }: { focusedAlert: IncidentAlert | null }) {
  const throughput = series.map((point, index) => ({
    x: chartX(index),
    y: chartY(point.throughputMbps, 80, 30),
  }));
  const dropRate = series.map((point, index) => ({
    x: chartX(index),
    y: chartY(point.dropRate, 5),
  }));
  const latency = series.map((point, index) => ({
    x: chartX(index),
    y: chartY(point.latency, 120, 20),
  }));

  return (
    <div className="chart-panel">
      <div className="panel-title-row">
        <h3>QoE: Throughput, Drop Rate and Latency</h3>
        <span>Dual KPI overlay</span>
      </div>
      <svg viewBox="0 0 820 260" className="line-chart" role="img" aria-label="QoE throughput and drop rate">
        <ChartGrid />
        <ChangeBands focusedAlert={focusedAlert} />
        <ThresholdLine value={55} max={80} min={30} label="target throughput" tone="target" />
        <ThresholdLine value={3} max={5} label="3% max drop" tone="danger" />
        <path className="chart-line throughput-line" d={linePath(throughput)} />
        <path className="chart-line drop-line" d={linePath(dropRate)} />
        <path className="chart-line latency-line" d={linePath(latency)} />
        <AxisLabels />
      </svg>
      <div className="legend-row">
        <span className="legend-item throughput-dot">Median user throughput</span>
        <span className="legend-item drop-dot">Drop rate</span>
        <span className="legend-item latency-dot">P95 latency</span>
      </div>
    </div>
  );
}

function GeoHeatmap({
  selectedMetric,
  onMetricChange,
  focusedCellId,
}: {
  selectedMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
  focusedCellId: string | null;
}) {
  const definition = metricDefinitions[selectedMetric];
  const focusedCell = focusedCellId ? cells.find((cell) => cell.id === focusedCellId) : null;

  return (
    <Card className="map-card">
      <CardHeader>
        <div>
          <CardTitle>
            <Map data-icon="inline-start" />
            Affected area heatmap
          </CardTitle>
          <CardDescription>Abstract CBD district view with quantized congestion buckets.</CardDescription>
        </div>
        <ToggleGroup value={selectedMetric} onValueChange={onMetricChange}>
          {orderedMetrics.map((metric) => (
            <ToggleGroupItem key={metric} value={metric}>
              {metricDefinitions[metric].label.replace(" utilization", "")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <div className="map-layout">
          <svg viewBox="0 0 100 86" className="district-map" role="img" aria-label="CBD cell sector congestion heatmap">
            <rect x="5" y="7" width="90" height="72" rx="3" className="district-base" />
            <path d="M12 22H88M12 41H88M12 60H88M24 12V75M48 12V75M72 12V75" className="district-streets" />
            {cells.map((cell) => {
              const value = cell[selectedMetric];
              const severity = severityForMetric(selectedMetric, value);
              const focused = cell.id === focusedCellId;
              return (
                <g key={cell.id} className={cn("map-sector", focused && "is-focused")}>
                  <polygon points={cell.polygon} className={cn("sector-fill", `heat-${selectedMetric}-${severity}`)} />
                  <circle cx={cell.x} cy={cell.y} r={focused ? 2.6 : 1.8} className="sector-dot" />
                  <text x={cell.x + 2.5} y={cell.y + 1.5}>
                    {cell.sector}
                  </text>
                </g>
              );
            })}
            {cells
              .filter((cell) => cell.enterpriseSite)
              .map((cell) => (
                <TooltipSvgPoint key={cell.enterpriseSite} cell={cell} />
              ))}
          </svg>
          <div className="map-side">
            <div className="focused-value">
              <span>Focused sector</span>
              <strong>{focusedCell?.id ?? "None selected"}</strong>
              <p>
                {focusedCell ? `${definition.label}: ${formatMetric(selectedMetric, focusedCell[selectedMetric])}` : "Select an alert to lock context."}
              </p>
            </div>
            <HeatLegend metric={selectedMetric} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TooltipSvgPoint({ cell }: { cell: CellSector }) {
  return (
    <g className="enterprise-marker">
      <rect x={cell.x - 2.1} y={cell.y - 2.1} width="4.2" height="4.2" rx="0.8" />
      <title>{cell.enterpriseSite}</title>
    </g>
  );
}

function HeatLegend({ metric }: { metric: MetricKey }) {
  const definition = metricDefinitions[metric];
  const tones: Severity[] = ["ok", "ok", "warning", "critical", "critical"];

  return (
    <div className="heat-legend">
      <span>{definition.label} buckets</span>
      {definition.buckets.map((bucket, index) => (
        <div key={bucket} className="legend-scale-row">
          <i className={`legend-swatch heat-${metric}-${tones[index]}`} />
          <span>
            {bucket}
            {definition.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

function TopologyView({ focusedAlert }: { focusedAlert: IncidentAlert | null }) {
  const focusPath = focusedAlert?.topologyPath ?? [];

  return (
    <Card className="topology-card">
      <CardHeader>
        <div>
          <CardTitle>
            <Network data-icon="inline-start" />
            Correlated topology
          </CardTitle>
          <CardDescription>Cell to aggregation to transport to core, scoped to selected alert.</CardDescription>
        </div>
        <Badge variant={focusedAlert ? focusedAlert.severity : "outline"}>{focusedAlert ? focusedAlert.impactedElement : "No focus"}</Badge>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 100 92" className="topology-svg" role="img" aria-label="Network topology health schematic">
          {topologyEdges.map((edge) => {
            const source = topologyNodes.find((node) => node.id === edge.source)!;
            const target = topologyNodes.find((node) => node.id === edge.target)!;
            const focused = focusPath.includes(edge.source) && focusPath.includes(edge.target);
            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={cn("topology-edge", `traffic-${edge.traffic}`, focused && "is-focused")}
              />
            );
          })}
          {topologyNodes.map((node) => {
            const focused = focusPath.includes(node.id);
            return (
              <g key={node.id} className={cn("topology-node", `severity-${node.severity}`, focused && "is-focused")}>
                {node.type === "cell" ? <circle cx={node.x} cy={node.y} r="5.2" /> : <rect x={node.x - 6.5} y={node.y - 5} width="13" height="10" rx="2" />}
                <text x={node.x} y={node.y + 13}>
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="topology-note">
          <Badge variant="critical">3.8% loss</Badge>
          <span>AGG-02 to BH-17 edge is the highest confidence transport bottleneck.</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertFeed({
  focusedAlertId,
  onSelect,
  onClear,
}: {
  focusedAlertId: string;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <Card className="alerts-card">
      <CardHeader>
        <div>
          <CardTitle>
            <AlertTriangle data-icon="inline-start" />
            Alert feed
          </CardTitle>
          <CardDescription>Click an alert to persist focus across panels.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <RotateCcw data-icon="inline-start" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="alert-list">
        {alerts.map((alert) => (
          <button
            key={alert.id}
            type="button"
            className={cn("alert-item", focusedAlertId === alert.id && "is-selected")}
            onClick={() => onSelect(alert.id)}
          >
            <span className="alert-time">{alert.time}</span>
            <Badge variant={alert.severity}>{alert.severity}</Badge>
            <strong>{alert.impactedElement}</strong>
            <p>{alert.description}</p>
            <span className="alert-status">{alert.status}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function AnomalyTable({ focusedAlert }: { focusedAlert: IncidentAlert | null }) {
  const focusPath = focusedAlert?.topologyPath ?? [];

  return (
    <Card className="table-card">
      <CardHeader>
        <div>
          <CardTitle>
            <Gauge data-icon="inline-start" />
            Anomaly-focused elements
          </CardTitle>
          <CardDescription>Cells and links ranked by congestion correlation and current KPI deviation.</CardDescription>
        </div>
        <Badge variant="outline">Last 24h sparklines</Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Element ID</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Tech</TableHead>
              <TableHead>Util.</TableHead>
              <TableHead>P95 Latency</TableHead>
              <TableHead>Drop</TableHead>
              <TableHead>Anomaly</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anomalyRows.map((row) => {
              const focused = focusedAlert?.elementId === row.elementId || focusPath.includes(row.elementId);
              const severity = row.anomalyScore > 85 ? "critical" : row.anomalyScore > 60 ? "warning" : "ok";
              return (
                <TableRow key={row.id} className={cn(focused && "is-focused-row")}>
                  <TableCell>
                    <strong>{row.elementId}</strong>
                  </TableCell>
                  <TableCell>{row.region}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{row.tech}</Badge>
                  </TableCell>
                  <TableCell className={cn("metric-cell", severityForMetric("prbUtilization", row.utilization))}>
                    {row.utilization.toFixed(1)}%
                  </TableCell>
                  <TableCell className={cn("metric-cell", severityForMetric("latency", row.latency))}>{row.latency}ms</TableCell>
                  <TableCell className={cn("metric-cell", severityForMetric("dropRate", row.dropRate))}>{row.dropRate.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge variant={severity}>{row.anomalyScore}</Badge>
                  </TableCell>
                  <TableCell>
                    <Sparkline values={row.sparkline} critical={row.sparkline.some((value) => value > 85)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Sparkline({ values, critical }: { values: number[]; critical?: boolean }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => ({
    x: 3 + index * (64 / (values.length - 1)),
    y: 26 - ((value - min) / Math.max(max - min, 1)) * 21,
  }));

  return (
    <svg viewBox="0 0 72 30" className="sparkline" aria-label="24 hour utilization sparkline">
      <path className={critical ? "sparkline-critical" : "sparkline-ok"} d={linePath(points)} />
      <line x1="3" x2="69" y1="8" y2="8" className="sparkline-threshold" />
    </svg>
  );
}

function ChartGrid() {
  return (
    <g className="chart-grid-lines">
      {[42, 87, 132, 177, 222].map((y) => (
        <line key={`h-${y}`} x1="48" x2="792" y1={y} y2={y} />
      ))}
      {[48, 141, 234, 327, 420, 513, 606, 699, 792].map((x) => (
        <line key={`v-${x}`} x1={x} x2={x} y1="24" y2="222" />
      ))}
    </g>
  );
}

function ChangeBands({ focusedAlert }: { focusedAlert: IncidentAlert | null }) {
  return (
    <g>
      {changeEvents.map((event) => {
        const start = timeX(event.start);
        const end = timeX(event.end);
        return (
          <g key={event.id}>
            <rect x={start} y="24" width={Math.max(end - start, 6)} height="198" className="change-band" />
            <text x={start + 4} y="38" className="change-label">
              {event.label}
            </text>
          </g>
        );
      })}
      {focusedAlert ? (
        <rect
          x={timeX(focusedAlert.window.start)}
          y="22"
          width={Math.max(timeX(focusedAlert.window.end) - timeX(focusedAlert.window.start), 8)}
          height="204"
          className="focus-band"
        />
      ) : null}
    </g>
  );
}

function ThresholdLine({
  value,
  max,
  min = 0,
  label,
  tone = "danger",
}: {
  value: number;
  max: number;
  min?: number;
  label: string;
  tone?: "danger" | "target";
}) {
  const y = chartY(value, max, min);

  return (
    <g className={cn("threshold-line", `threshold-${tone}`)}>
      <line x1="48" x2="792" y1={y} y2={y} />
      <text x="650" y={y - 6}>
        {label}
      </text>
    </g>
  );
}

function AxisLabels() {
  return (
    <g className="axis-labels">
      {series.map((point, index) => (
        <text key={point.time} x={chartX(index)} y="246">
          {point.time}
        </text>
      ))}
    </g>
  );
}

function chartX(index: number) {
  return 48 + index * (744 / (series.length - 1));
}

function chartY(value: number, max: number, min = 0) {
  const bounded = Math.max(min, Math.min(max, value));
  return 222 - ((bounded - min) / (max - min)) * 198;
}

function timeX(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const minutes = hour * 60 + minute;
  const start = 13 * 60 + 50;
  const end = 15 * 60 + 10;
  return 48 + ((minutes - start) / (end - start)) * 744;
}

function linePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

function getFocusedCellId(alert: IncidentAlert) {
  if (cells.some((cell) => cell.id === alert.elementId)) return alert.elementId;
  const pathCell = alert.topologyPath.find((id) => cells.some((cell) => cell.id === id));
  return pathCell ?? focusFallbackCell;
}
