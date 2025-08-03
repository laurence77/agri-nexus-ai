import Navigation from "@/components/layout/Navigation";
import { SensorDashboard } from "@/components/sensors/sensor-dashboard";

export default function Sensors() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <SensorDashboard farmId="farm-1" fieldId="field-1" />
      </div>
    </div>
  );
}