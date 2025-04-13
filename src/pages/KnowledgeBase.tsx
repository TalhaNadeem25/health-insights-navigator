import React from 'react';
import { HealthKnowledgeBase } from "@/components/HealthKnowledgeBase";
import { PageHeader } from "@/components/PageHeader";
import { Database } from "lucide-react";

const KnowledgeBase = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Health Knowledge Base"
        subheading="Store and retrieve personalized health information using vector-based semantic search"
        icon={<Database className="h-6 w-6" />}
      />
      
      <HealthKnowledgeBase />
    </div>
  );
};

export default KnowledgeBase; 