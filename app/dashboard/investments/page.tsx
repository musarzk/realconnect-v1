"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, BarChart3, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/auth-context";
import { LoadingCard } from "@/components/loading-spinner";

interface Investment {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    images: string[];
  };
  amount: number;
  investmentDate: string;
  roi: number;
  status: "active" | "completed" | "pending";
  returns: number;
}

export default function InvestmentsPage() {
  // read the context safely
  const auth = useContext(AuthContext) as any | undefined;
  // make user explicit and safe to reference
  const user: any | null = auth?.user ?? null;

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalReturns: 0,
    activeInvestments: 0,
    avgROI: 0,
  });

  useEffect(() => {
    // only fetch when we have a user
    if (user) {
      fetchInvestments();
    } else {
      // if there's no user, reset state and stop loading
      setInvestments([]);
      setStats({ totalInvested: 0, totalReturns: 0, activeInvestments: 0, avgROI: 0 });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchInvestments = async () => {
    if (!user?.id) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/investments?userId=${encodeURIComponent(user.id)}`);
      if (!response.ok) throw new Error("Failed to fetch investments");

      const data: Investment[] = await response.json();
      setInvestments(Array.isArray(data) ? data : []);

      // Calculate stats
      const totalInvested = (data || []).reduce((sum: number, inv: Investment) => sum + (inv.amount ?? 0), 0);
      const totalReturns = (data || []).reduce((sum: number, inv: Investment) => sum + (inv.returns ?? 0), 0);
      const activeInvestments = (data || []).filter((inv: Investment) => inv.status === "active").length;
      const avgROI = (data && data.length > 0)
        ? (data.reduce((sum: number, inv: Investment) => sum + (inv.roi ?? 0), 0) / data.length)
        : 0;

      setStats({ totalInvested, totalReturns, activeInvestments, avgROI });
    } catch (error) {
      console.error("Failed to fetch investments:", error);
      setInvestments([]);
      setStats({ totalInvested: 0, totalReturns: 0, activeInvestments: 0, avgROI: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingCard />;
  }

  const statsDisplay = [
    {
      label: "Total Invested",
      value: `₦${stats.totalInvested.toLocaleString()}`,
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      label: "Total Returns",
      value: `₦${stats.totalReturns.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Active Investments",
      value: stats.activeInvestments,
      icon: BarChart3,
      color: "text-purple-500",
    },
    {
      label: "Average ROI",
      value: `${stats.avgROI.toFixed(1)}%`,
      icon: ArrowUpRight,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Investments</h1>
        <p className="text-muted-foreground">Track and manage your property investments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat) => (
          <Card key={stat.label} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs mb-1">{stat.label}</p>
                <p className="text-lg font-bold break-words">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-secondary flex-shrink-0 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Investments List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Your Investments</h2>
          <Link href="/investor-portal">
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Find New Opportunities
            </Button>
          </Link>
        </div>

        {investments.length > 0 ? (
          <div className="space-y-4">
            {investments.map((investment) => (
              <div
                key={investment._id}
                className="flex flex-col md:flex-row md:items-center gap-3 p-4 border border-border rounded-lg hover:bg-blue-50/50 transition-colors"
              >
                <img
                  src={investment.propertyId.images[0] || "/placeholder.svg"}
                  alt={investment.propertyId.title}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-2 text-sm md:text-base">{investment.propertyId.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <DollarSign className="h-3 w-3 flex-shrink-0" />
                      ₦{investment.amount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <TrendingUp className="h-3 w-3 flex-shrink-0" />
                      ROI: {investment.roi}%
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      {new Date(investment.investmentDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-muted-foreground mb-1">Returns</p>
                    <p className="text-base font-bold text-green-500 whitespace-nowrap">
                      +₦{investment.returns.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${investment.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : investment.status === "completed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                    >
                      {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                    </span>
                  </div>
                  <Link href={`/property/${investment.propertyId._id}`} className="flex-shrink-0">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You haven't made any investments yet</p>
            <Link href="/investor-portal">
              <Button>Explore Investment Opportunities</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
