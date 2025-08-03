import Navigation from "@/components/layout/Navigation";
import { EquipmentDashboard } from "@/components/equipment/equipment-dashboard";

export default function Equipment() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <EquipmentDashboard />
      </div>
    </div>
  );
}