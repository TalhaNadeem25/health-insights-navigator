
import { ArrowRight, BarChart2, Brain, FileText, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Individual Risk Assessment",
    description: "LLM-powered analysis of individual health data to identify risk factors",
    icon: Users,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Community Risk Dashboard",
    description: "Interactive heatmaps showing at-risk populations in your communities",
    icon: BarChart2,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Resource Optimization",
    description: "AI-driven recommendations for optimal resource allocation",
    icon: Shield,
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Data Ingestion & Analysis",
    description: "Upload and analyze unstructured health data from multiple sources",
    icon: FileText,
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "LLM-Powered Insights",
    description: "Advanced language models that understand health data context",
    icon: Brain,
    color: "bg-rose-100 text-rose-700",
  },
];

const Index = () => {
  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-health-600 to-health-800 bg-clip-text text-transparent">
            LLM-Powered Predictive Health & Resource Optimization
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Harness the power of AI to identify at-risk communities and optimize
            your health resources where they're needed most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-health-600 hover:bg-health-700">
              <Link to="/dashboard">
                Explore Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/risk-assessment">Try Risk Assessment</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform combines advanced language models with health data to provide
            actionable insights for NGOs and healthcare organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="dashboard-card border-t-4 border-t-health-600">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon size={24} />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-foreground/80">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted rounded-xl p-8 mt-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Make Data-Driven Decisions</h2>
            <p className="text-lg mb-6">
              Our platform helps you identify high-risk individuals and communities,
              understand their needs through text analysis, and allocate resources effectively.
            </p>
            <ul className="space-y-3">
              {[
                "Analyze diverse text data sources",
                "Identify emerging health trends",
                "Generate actionable recommendations",
                "Optimize resource distribution",
                "Track impact and refine strategies",
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <div className="mr-3 h-6 w-6 rounded-full bg-health-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                    ✓
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 bg-health-600 hover:bg-health-700">
              <Link to="/data-upload">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-health-500/20 to-health-700/20 flex items-center justify-center">
              <div className="text-center">
                <Brain className="h-16 w-16 text-health-600 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  LLM-Powered Analysis Visualization
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
