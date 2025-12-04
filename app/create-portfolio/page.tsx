"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
    ArrowLeft,
    ArrowRight,
    PieChart,
    TrendingUp,
    Shield,
    Zap,
    Target,
    CheckCircle,
} from "lucide-react";

interface InvestmentStrategy {
    id: string;
    name: string;
    description: string;
    riskLevel: "low" | "medium" | "high";
    icon: any;
    features: string[];
    recommended?: boolean;
}

export default function CreatePortfolioPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/signup");
        } else if (!isLoading && user && !(user as any).approved) {
            alert("Your account is pending admin approval. Please wait for approval before creating a portfolio.");
            router.push("/investor-portal");
        }
    }, [user, isLoading, router]);

    const propertyId = searchParams.get("propertyId");
    const propertyTitle = searchParams.get("title") || "Investment Property";
    const propertyPrice = searchParams.get("price") || "0";
    const expectedROI = searchParams.get("roi") || "12";

    const [portfolioName, setPortfolioName] = useState("");
    const [portfolioDescription, setPortfolioDescription] = useState("");
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

    const strategies: InvestmentStrategy[] = [
        {
            id: "conservative",
            name: "Conservative Growth",
            description: "Low-risk strategy focused on stable, long-term returns",
            riskLevel: "low",
            icon: Shield,
            features: [
                "Focus on grade A+ and A properties",
                "Diversified across multiple properties",
                "Steady dividend payments",
                "Capital preservation priority",
            ],
        },
        {
            id: "balanced",
            name: "Balanced Portfolio",
            description: "Mix of growth and stability for optimal returns",
            riskLevel: "medium",
            icon: Target,
            features: [
                "Mix of A, B+, and B grade properties",
                "Balanced risk-reward ratio",
                "Regular income + capital growth",
                "Flexible investment allocation",
            ],
            recommended: true,
        },
        {
            id: "aggressive",
            name: "Aggressive Growth",
            description: "High-risk, high-reward strategy for maximum returns",
            riskLevel: "high",
            icon: Zap,
            features: [
                "Focus on high-ROI opportunities",
                "Accepts B and C grade properties",
                "Reinvest dividends for compound growth",
                "Maximum capital appreciation",
            ],
        },
    ];

    const handleContinue = () => {
        if (!portfolioName || !selectedStrategy) {
            alert("Please enter a portfolio name and select a strategy");
            return;
        }

        // Store portfolio info in sessionStorage
        const portfolioData = {
            name: portfolioName,
            description: portfolioDescription,
            strategy: selectedStrategy,
            createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem("pendingPortfolio", JSON.stringify(portfolioData));

        // Navigate to investment plan page
        const params = new URLSearchParams({
            propertyId: propertyId || "",
            title: propertyTitle,
            price: propertyPrice,
            roi: expectedROI,
            portfolioName: portfolioName,
            strategy: selectedStrategy,
        });
        router.push(`/investment-plan?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Opportunities
                </Button>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                1
                            </div>
                            <span className="ml-2 font-medium">Create Portfolio</span>
                        </div>
                        <div className="w-16 h-0.5 bg-border mx-2"></div>
                        <div className="flex items-center opacity-50">
                            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                                2
                            </div>
                            <span className="ml-2 font-medium">Choose Plan</span>
                        </div>
                        <div className="w-16 h-0.5 bg-border mx-2"></div>
                        <div className="flex items-center opacity-50">
                            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                                3
                            </div>
                            <span className="ml-2 font-medium">Confirm</span>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Create Your Portfolio</h1>
                    <p className="text-muted-foreground text-lg">
                        Set up your investment portfolio for: <span className="font-semibold text-foreground">{propertyTitle}</span>
                    </p>
                </div>

                {/* Portfolio Details Form */}
                <Card className="p-6 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Portfolio Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Portfolio Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g., Real Estate Growth Portfolio"
                                value={portfolioName}
                                onChange={(e) => setPortfolioName(e.target.value)}
                                className="text-lg"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Choose a memorable name for your investment portfolio
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description (Optional)
                            </label>
                            <Textarea
                                placeholder="Describe your investment goals and strategy..."
                                value={portfolioDescription}
                                onChange={(e) => setPortfolioDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                </Card>

                {/* Investment Strategy Selection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Select Investment Strategy</h2>
                    <p className="text-muted-foreground mb-6">
                        Choose a strategy that aligns with your risk tolerance and investment goals
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {strategies.map((strategy) => (
                            <Card
                                key={strategy.id}
                                className={`p-6 cursor-pointer transition-all ${selectedStrategy === strategy.id
                                    ? "ring-2 ring-primary shadow-lg"
                                    : "hover:shadow-md"
                                    } ${strategy.recommended ? "border-primary border-2" : ""}`}
                                onClick={() => setSelectedStrategy(strategy.id)}
                            >
                                {strategy.recommended && (
                                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                                        RECOMMENDED
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <strategy.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{strategy.name}</h3>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${strategy.riskLevel === "low"
                                                ? "bg-green-100 text-green-700"
                                                : strategy.riskLevel === "medium"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {strategy.riskLevel.toUpperCase()} RISK
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4">
                                    {strategy.description}
                                </p>

                                <div className="space-y-2">
                                    {strategy.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-full mt-4"
                                    variant={selectedStrategy === strategy.id ? "default" : "outline"}
                                >
                                    {selectedStrategy === strategy.id ? "Selected" : "Select Strategy"}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-end">
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        disabled={!portfolioName || !selectedStrategy}
                        className="min-w-[200px]"
                    >
                        Continue to Investment Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    );
}
