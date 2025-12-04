"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DollarSign, TrendingUp, Activity, CreditCard } from "lucide-react";

interface Investment {
    _id: string;
    userId: {
        firstName: string;
        lastName: string;
        email: string;
    };
    propertyId: {
        title: string;
        location: string;
        price: number;
    };
    planId: string;
    amount: number;
    status: string;
    returns: number;
    createdAt: string;
}

export default function AdminInvestmentsPage() {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAmountUSD: 0,
        totalAmountNGN: 0,
        activeCount: 0,
        totalCount: 0
    });

    // Exchange rate (mock)
    const EXCHANGE_RATE = 1600; // 1 USD = 1600 NGN

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            const res = await fetch("/api/investments");
            const data = await res.json();
            
            console.log("Investments data:", data);
            
            if (Array.isArray(data)) {
                setInvestments(data);
                calculateStats(data);
            } else {
                setInvestments([]);
            }
        } catch (error) {
            console.error("Failed to fetch investments:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Investment[]) => {
        const totalUSD = data.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const active = data.filter(inv => inv.status === 'active').length;
        
        setStats({
            totalAmountUSD: totalUSD,
            totalAmountNGN: totalUSD * EXCHANGE_RATE,
            activeCount: active,
            totalCount: data.length
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Investment Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Investment (USD)</h3>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">${stats.totalAmountUSD.toLocaleString()}</div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Investment (NGN)</h3>
                        <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">₦{stats.totalAmountNGN.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Rate: ₦{EXCHANGE_RATE}/$1</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Active Investments</h3>
                        <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold">{stats.activeCount}</div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalCount}</div>
                </Card>
            </div>

            <Card className="p-6">
                {loading ? (
                    <p>Loading investments...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Investor</TableHead>
                                <TableHead>Property</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {investments.map((inv) => (
                                <TableRow key={inv._id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {inv.userId?.firstName} {inv.userId?.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {inv.userId?.email}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{inv.propertyId?.title || "Unknown Property"}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {inv.propertyId?.location}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{inv.planId}</TableCell>
                                    <TableCell>${inv.amount?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(inv.status)}>
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {inv.createdAt ? format(new Date(inv.createdAt), "MMM d, yyyy") : "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {investments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No investments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
