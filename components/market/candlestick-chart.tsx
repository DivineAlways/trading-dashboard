"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import { CandlestickData } from "@/lib/types";

interface Props {
  data: CandlestickData[];
  symbol: string;
}

export function CandlestickChart({ data, symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "rgb(15, 15, 20)" },
        textColor: "rgba(200, 200, 220, 0.8)",
      },
      grid: {
        vertLines: { color: "rgba(100, 100, 140, 0.1)" },
        horzLines: { color: "rgba(100, 100, 140, 0.1)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: 500,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candleSeries.setData(data.map((d) => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })));

    if (data.some((d) => d.volume)) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      volumeSeries.setData(data.map((d) => ({
        time: d.time as any,
        value: d.volume || 0,
        color: d.close >= d.open ? "rgba(38, 166, 154, 0.3)" : "rgba(239, 83, 80, 0.3)",
      })));
    }

    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [data, symbol]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        No data available for {symbol}
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}
