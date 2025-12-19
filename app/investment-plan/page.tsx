"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
    ArrowLeft,
    TrendingUp,
    Calendar,
    CheckCircle,
    DollarSign,
    Wallet,
    Shield,
    PieChart,
} from "lucide-react";
import { StatusModal } from "@/components/status-modal";

interface InvestmentPlan {
    id: string;
    name: string;
    minAmount: number;
    expectedReturn: number;
    duration: string;
    features: string[];
    recommended?: boolean;
}

export default function InvestmentPlanPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"success" | "error" | "info">("info");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalAction, setModalAction] = useState<(() => void) | undefined>(undefined);

    const showModal = (type: "success" | "error" | "info", title: string, message: string, action?: () => void) => {
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalAction(() => action);
        setModalOpen(true);
    };

    // Redirect to signup if not authenticated or not approved
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/signup");
        } else if (!authLoading && user && !(user as any).approved) {
            // Use modal instead of alert, but we need to handle the redirect after modal close
            // Since we can't block execution like alert(), we just show the modal.
            // The user will be redirected when they interact with the modal or we can just redirect.
            // For now, let's try to show the modal and redirect on close/action.
            showModal(
                "info", 
                "Approval Pending", 
                "Your account is pending admin approval. Please wait for approval before selecting an investment plan.",
                () => router.push("/investor-portal")
            );
        }
    }, [user, authLoading, router]);

    const propertyId = searchParams.get("propertyId");
    const propertyTitle = searchParams.get("title") || "Investment Property";
    const propertyPrice = parseFloat(searchParams.get("price") || "0");
    const expectedROI = searchParams.get("roi") || "12";

    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [investmentAmount, setInvestmentAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const investmentPlans: InvestmentPlan[] = [
        {
            id: "starter",
            name: "Starter Plan",
            minAmount: 5000,
            expectedReturn: 8.5,
            duration: "12 months",
            features: [
                "Low minimum investment",
                "Quarterly dividend payments",
                "Access to investor dashboard",
                "Property performance reports",
            ],
        },
        {
            id: "growth",
            name: "Growth Plan",
            minAmount: 25000,
            expectedReturn: 12.0,
            duration: "24 months",
            features: [
                "Higher expected returns",
                "Monthly dividend payments",
                "Priority property access",
                "Dedicated account manager",
                "Tax optimization guidance",
            ],
            recommended: true,
        },
        {
            id: "premium",
            name: "Premium Plan",
            minAmount: 100000,
            expectedReturn: 15.5,
            duration: "36 months",
            features: [
                "Maximum return potential",
                "Weekly dividend payments",
                "Exclusive property deals",
                "Personal wealth advisor",
                "Advanced portfolio analytics",
                "VIP investor events",
            ],
        },
    ];

    const handleInvest = async () => {
        if (!user) {
            showModal("info", "Login Required", "Please log in to invest", () => router.push("/login"));
            return;
        }

        if (!selectedPlan || !investmentAmount) {
            showModal("error", "Missing Information", "Please select a plan and enter an investment amount");
            return;
        }

        const plan = investmentPlans.find((p) => p.id === selectedPlan);
        if (!plan) return;

        const amount = parseFloat(investmentAmount);
        if (amount < plan.minAmount) {
            showModal("error", "Invalid Amount", `Minimum investment for this plan is $${plan.minAmount.toLocaleString()}`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/payment/flutterwave", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    phonenumber: "",
                    userId: user.id,
                    propertyId: propertyId,
                    planId: selectedPlan,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Payment initiation failed:", data);
                showModal("error", "Payment Failed", data.message || data.error || "Failed to initiate payment. Please try again.");
                setLoading(false);
                return;
            }

            if (data.link) {
                window.location.href = data.link;
            } else {
                showModal("error", "Payment Failed", "Failed to get payment link from server.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Investment error:", error);
            showModal("error", "Connection Error", "An unexpected error occurred. Please check your connection and try again.");
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Button variant="outline" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Opportunities
                </Button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Investment Plans</h1>
                    <p className="text-muted-foreground text-lg">
                        Choose your investment plan for: <span className="font-semibold text-foreground">{propertyTitle}</span>
                    </p>
                </div>

                <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Property Value</p>
                            <p className="text-2xl font-bold">${(propertyPrice / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Expected ROI</p>
                            <p className="text-2xl font-bold text-green-600">{expectedROI}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Investment Type</p>
                            <p className="text-2xl font-bold">Fractional</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                            <p className="text-2xl font-bold text-blue-600">Medium</p>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {investmentPlans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`p-6 cursor-pointer transition-all ${selectedPlan === plan.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                                } ${plan.recommended ? "border-primary border-2" : ""}`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.recommended && (
                                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                                    RECOMMENDED
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="mb-4">
                                <p className="text-3xl font-bold text-primary">${(plan.minAmount / 1000).toFixed(0)}K</p>
                                <p className="text-sm text-muted-foreground">Minimum investment</p>
                            </div>

                            <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Expected Return</p>
                                    <p className="font-bold text-green-600">{plan.expectedReturn.toFixed(1)}% annually</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{plan.duration} commitment</span>
                            </div>

                            <div className="space-y-2 mb-6">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full" variant={selectedPlan === plan.id ? "default" : "outline"}>
                                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                            </Button>
                        </Card>
                    ))}
                </div>

                {selectedPlan && (
                    <Card className="p-6 mb-8">
                        <h3 className="text-xl font-bold mb-4">Enter Investment Amount</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="text-sm text-muted-foreground mb-2 block">Investment Amount (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={investmentAmount}
                                        onChange={(e) => setInvestmentAmount(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Minimum: ${investmentPlans.find((p) => p.id === selectedPlan)?.minAmount.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleInvest} disabled={loading || !investmentAmount} className="w-full sm:w-auto" size="lg">
                                    {loading ? (
                                        "Processing..."
                                    ) : (
                                        <>
                                            <Wallet className="mr-2 h-4 w-4" />
                                            Confirm Investment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <Shield className="h-12 w-12 text-primary mb-4" />
                        <h3 className="font-bold mb-2">Secure Investment</h3>
                        <p className="text-sm text-muted-foreground">
                            All investments are backed by real property assets and protected by legal frameworks.
                        </p>
                    </Card>
                    <Card className="p-6">
                        <PieChart className="h-12 w-12 text-accent mb-4" />
                        <h3 className="font-bold mb-2">Diversified Portfolio</h3>
                        <p className="text-sm text-muted-foreground">
                            Spread your investment across multiple properties to minimize risk.
                        </p>
                    </Card>
                    <Card className="p-6">
                        <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                        <h3 className="font-bold mb-2">Transparent Returns</h3>
                        <p className="text-sm text-muted-foreground">
                            Track your investment performance in real-time with detailed analytics.
                        </p>
                    </Card>
                </div>
            </div>

            <Footer />
            <StatusModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                onAction={modalAction}
            />
        </div>
    );
}
