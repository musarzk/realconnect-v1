"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Investor {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  totalInvested?: number;
  activeInvestments?: number;
  joinDate?: string;
}

export default function InvestorDirectory() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const ac = new AbortController();

    async function fetchInvestors() {
      setLoading(true);
      try {
        const res = await fetch("/api/investors", { signal: ac.signal });
        if (!res.ok) {
          throw new Error(`Failed to fetch investors: ${res.status}`);
        }
        const data = await res.json();

        // Defensive: ensure data is an array before mapping
        console.log("Number of investors:", Array.isArray(data) ? data.length : 0);
        setInvestors(Array.isArray(data) ? data : []);
      } catch (error: any) {
        if (error.name === "AbortError") {
          // fetch was aborted, ignore
          return;
        }
        console.error("Failed to fetch investors:", error);
        setInvestors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInvestors();

    return () => {
      ac.abort();
    };
  }, []); // run once on mount

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Investor Directory</h1>

      <Card className="p-6">
        {loading ? (
          <p>Loading investors...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Invested</TableHead>
                <TableHead>Active Plans</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investors.length > 0 ? (
                investors.map((investor) => {
                  const firstInitial = investor.firstName?.[0] ?? "";
                  const lastInitial = investor.lastName?.[0] ?? "";

                  return (
                    <TableRow key={investor._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {investor.avatar ? (
                              <AvatarImage src={investor.avatar} alt={`${investor.firstName ?? ""} ${investor.lastName ?? ""}`} />
                            ) : (
                              <AvatarFallback>
                                {firstInitial}
                                {lastInitial}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {investor.firstName ?? ""} {investor.lastName ?? ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{investor.email ?? "N/A"}</p>
                          <p className="text-sm text-muted-foreground">
                            {investor.phone ?? "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{investor.location ?? "N/A"}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${((investor.totalInvested ?? 0)).toLocaleString()}
                      </TableCell>
                      <TableCell>{investor.activeInvestments ?? 0}</TableCell>
                      <TableCell>
                        {investor.joinDate
                          ? format(new Date(investor.joinDate), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No investors found
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
