import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, Droplets, Wind, Thermometer } from "lucide-react";

export default function WeatherWidget() {
  return (
    <Card className="shadow-soft hover:shadow-primary transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CloudSun className="h-5 w-5 text-primary" />
          <span>Current Weather</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-warning" />
            <span className="text-sm text-muted-foreground">Temperature</span>
          </div>
          <span className="font-semibold">72°F</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Humidity</span>
          </div>
          <span className="font-semibold">65%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Wind Speed</span>
          </div>
          <span className="font-semibold">8 mph</span>
        </div>
        
        <div className="bg-gradient-earth p-3 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-primary">Perfect conditions</span> for irrigation. 
            Low wind, optimal humidity for crop health.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}