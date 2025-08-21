"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";


// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type CustomTooltipProps = {
  active?: boolean;
  payload?: any;
  color?: string;
  label?: any;
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  labelFormatter?: (v: any) => React.ReactNode;
  formatter?: (value: any, entry?: any) => any;
  labelClassName?: string;
};

// ...existing code...
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: CustomTooltipProps) {
  const { config } = useChart();

  const payloadArr = Array.isArray(payload) ? payload : [];

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || payloadArr.length === 0) {
      return null;
    }

    const item = payloadArr[0];
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? (config[label as keyof typeof config]?.label || label)
        : itemConfig?.label;

    if (labelFormatter) {
      // call the formatter if provided
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value as any)}</div>;
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payloadArr,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || payloadArr.length === 0) {
    return null;
  }

  const nestLabel = payloadArr.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {/* Render payload entries if needed - keep simple for type-safety */}
        {payloadArr.map((entry: any, idx: number) => {
          const key = `${labelKey || entry?.dataKey || entry?.name || idx}`;
          const itemConfig = getPayloadConfigFromPayload(config, entry, key);
          const entryLabel = itemConfig?.label ?? entry?.name ?? key;
          const entryValue = formatter ? formatter(entry?.value, entry) : entry?.value;

          return (
            <div key={idx} className="flex items-center gap-2">
              {!hideIndicator && (
                <span
                  style={{ background: itemConfig ? `var(--color-${key})` : color ?? entry?.color }}
                  className={cn("inline-block h-2 w-2 shrink-0 rounded-full")}
                />
              )}
              <div className="flex flex-col">
                <span className="text-xs">{entryLabel}</span>
                <span className="text-sm font-medium">{entryValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ...existing code...

const ChartLegend = RechartsPrimitive.Legend;

// ...existing code...
// ...existing code...
type LegendContentProps = {
  className?: string;
  hideIcon?: boolean;
  payload?: any;
  verticalAlign?: RechartsPrimitive.LegendProps["verticalAlign"];
  nameKey?: string;
};

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: LegendContentProps) {
  const { config } = useChart();

  const payloadArr = Array.isArray(payload) ? payload : [];

  if (!payloadArr.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payloadArr.map((item: any, idx: number) => {
        const key = `${nameKey || item?.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const label = itemConfig?.label ?? item?.name ?? key;

        return (
          <div key={idx} className="flex items-center gap-2">
            {!hideIcon && (
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ background: itemConfig ? `var(--color-${key})` : item?.color }}
              />
            )}
            <span className="text-xs">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
// ...existing code...
// ...existing code...

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
