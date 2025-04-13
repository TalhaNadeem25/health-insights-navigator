import React from 'react';
import { Settings as SettingsComponent } from "@/components/Settings";
import { PageHeader } from "@/components/PageHeader";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Settings"
        subheading="Configure your application preferences and API keys"
        icon={<SettingsIcon className="h-6 w-6" />}
      />
      
      <SettingsComponent />
    </div>
  );
};

export default Settings; 