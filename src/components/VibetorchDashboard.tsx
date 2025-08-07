import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TaskManagement from "./TaskManagement";
import { useAuth } from "@/contexts/AuthContext";
import { GitHubConnectButton } from "./GitHubConnectButton";
import { toast } from 'sonner';

const VibetorchDashboard: React.FC = () => {
  return (
    <div>
      <h1>Vibetorch Dashboard</h1>
    </div>
  );
};

export default VibetorchDashboard;