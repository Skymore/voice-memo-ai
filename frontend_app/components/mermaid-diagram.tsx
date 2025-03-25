"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const id = `mermaid-${Math.round(Math.random() * 10000000)}`;

  useEffect(() => {
    const renderMermaid = async () => {
      if (typeof window === "undefined") return;
      
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "'Roboto', sans-serif",
          fontSize: 14,
          flowchart: {
            htmlLabels: true,
            curve: 'linear',
            useMaxWidth: true,
            diagramPadding: 5,
            nodeSpacing: 40,
            rankSpacing: 100
          }
        });
        
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setLoading(false);
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        setLoading(false);
      }
    };

    renderMermaid();
  }, [chart, id]);

  if (loading) {
    return <div className={className} style={{ minHeight: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div>Loading diagram...</div>
    </div>;
  }

  return (
    <div 
      className={className} 
      ref={mermaidRef} 
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ width: '100%', overflow: 'visible', maxWidth: '1000px', margin: '0 auto', minHeight: '520px' }}
    />
  );
}