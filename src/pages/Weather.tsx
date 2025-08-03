import Navigation from "@/components/layout/Navigation";
import { WeatherDashboard } from "@/components/weather/weather-dashboard";
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Eye,
  Umbrella,
  Sun,
  Cloud
} from "lucide-react";

export default function Weather() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <WeatherDashboard 
          farmId="farm-1" 
          location={{
            lat: 40.7128,
            lng: -74.0060,
            name: "Farm Location"
          }}
        />
      </div>
    </div>
  );
}