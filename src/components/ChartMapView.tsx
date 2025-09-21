import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { School as SchoolIcon } from "lucide-react";
import ReactDOMServer from "react-dom/server";

interface ChartMapViewProps {
  states: any[];
  districts: any[];
  schools: any[];
  trades: any[];
  trainers: any[];
}

const COLORS = ["#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const ChartMapView: React.FC<ChartMapViewProps> = ({
  states,
  districts,
  schools,
  trades,
  trainers,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Prepare PieChart data
    setChartData([
      { name: "States", value: states.length },
      { name: "Districts", value: districts.length },
      { name: "Schools", value: schools.length },
      { name: "Trades", value: trades.length },
      { name: "Trainers", value: trainers.length },
    ]);

    // Initialize Leaflet Map
    const map = L.map("schoolsMap").setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Create custom SVG icon using lucide-react
    const svgIcon = ReactDOMServer.renderToString(
      <SchoolIcon size={24} color="#4f46e5" />
    );

    const customIcon = L.divIcon({
      html: svgIcon,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    // Add markers
    schools.forEach((school) => {
      if (school.location?.coordinates?.length === 2) {
        const [lng, lat] = school.location.coordinates;
        L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `<b>${school.name}</b><br/>Trades: ${school.trades?.length || 0}`
          );
      }
    });

    return () => map.remove();
  }, [states, districts, schools, trades, trainers]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Pie Chart Box */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Map Box */}
      <Card>
        <CardHeader>
          <CardTitle>Schools Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="schoolsMap" className="h-80 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartMapView;
