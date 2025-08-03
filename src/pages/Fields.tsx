import Navigation from "@/components/layout/Navigation";
import { FarmManagement } from "@/components/farms/farm-management";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Droplets,
  Thermometer,
  Sprout,
  Plus,
  Eye,
  Settings,
  TrendingUp
} from "lucide-react";

export default function Fields() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <FarmManagement />
      </div>
    </div>
  );
}