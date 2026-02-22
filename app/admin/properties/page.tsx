/**
 * ========================================
 * ENHANCED ADMIN PROPERTIES PAGE
 * ========================================
 * 
 * Enhancements:
 * - Added "suspended" and "sold" property statuses
 * - Integrated edit functionality with Link to edit page
 * - Dynamic data fetching from MongoDB
 * - Status badges with appropriate icons
 * - Filter by all status types including new ones
 * - Improved error handling and loading states
 * 
 * Last Updated: November 26, 2025
 * ========================================
 */

"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Search,
  Clock,
  Ban,
  DollarSign,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { ApprovalModal } from "@/components/approval-modal";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  priceUsd?: number | null;
  status: "pending" | "approved" | "rejected" | "suspended" | "sold";
  type?: "sale" | "rent";
  ownerId?: string;
  createdAt?: string;
  views?: number;
  images?: string[];
  verified?: boolean;
}

export default function AdminProperties(): JSX.Element {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "suspended" | "sold">("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; title: string }>({
    isOpen: false,
    id: null,
    title: "",
  });

  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    id: string | null;
    title: string;
    currentStatus: "pending" | "approved" | "rejected" | "suspended" | "sold";
    status: "approved" | "rejected" | "suspended" | "sold";
  }>({
    isOpen: false,
    id: null,
    title: "",
    currentStatus: "pending",
    status: "approved",
  });

  // NEW: stable ref to hold the id being acted on (prevents missing-id races)
  const currentApprovalIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Build common headers (attach Bearer token from localStorage if present) */
  const buildHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /** Normalize id-like values to string or null */
  function normalizeId(val: unknown): string | null {
    // Handle null/undefined
    if (val == null) return null;

    // Handle direct string
    if (typeof val === "string") {
      return val.trim() || null;
    }

    // Handle number
    if (typeof val === "number") {
      return String(val);
    }

    // Handle object
    if (typeof val === "object") {
      const obj = val as any;

      // Try _id property first
      if (obj._id != null) {
        if (typeof obj._id === "string") return obj._id.trim() || null;
        if (typeof obj._id === "object" && obj._id.toString) {
          const str = obj._id.toString();
          return str !== "[object Object]" ? str : null;
        }
        return String(obj._id);
      }

      // Try id property
      if (obj.id != null) {
        if (typeof obj.id === "string") return obj.id.trim() || null;
        return String(obj.id);
      }

      // Try toString if available
      if (typeof obj.toString === "function") {
        const str = obj.toString();
        if (str && str !== "[object Object]") return str;
      }

      return null;
    }

    // Last resort
    try {
      const str = String(val);
      return str !== "[object Object]" ? str : null;
    } catch {
      return null;
    }
  }

  /** Fetch admin properties */
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/properties", {
        cache: "no-store",
        credentials: "include",
        headers: buildHeaders(),
      });

      const text = await res.text().catch(() => null);
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      console.log("fetchProperties response:", res.status, parsed);

      if (!res.ok) {
        const msg = typeof parsed === "string" ? parsed : parsed?.error ?? parsed?.message;
        throw new Error(msg ? `Failed to load properties (${res.status}): ${msg}` : `Failed to load properties (${res.status})`);
      }

      const data = parsed ?? null;
      setProperties(Array.isArray(data) ? data : data?.properties ?? []);
    } catch (err: any) {
      console.error("Failed to fetch admin properties:", err);
      setError(err?.message ?? "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  /** Filtered view for UI */
  const filteredProperties = properties.filter(
    (prop) =>
      (filterStatus === "all" || prop.status === filterStatus) &&
      (prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string, title: string) => {
    setDeleteModal({ isOpen: true, id, title });
  };

  /** Confirm delete (uses deleteModal state) */
  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const res = await fetch(`/api/properties/${encodeURIComponent(deleteModal.id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: buildHeaders(),
      });

      const text = await res.text().catch(() => null);
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      console.log("confirmDelete response:", res.status, parsed);

      if (!res.ok) {
        const msg = typeof parsed === "string" ? parsed : parsed?.error ?? parsed?.message;
        throw new Error(msg ? `Failed to delete property (${res.status}): ${msg}` : `Failed to delete property (${res.status})`);
      }

      setProperties((prev) => prev.filter((p) => p._id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, title: "" });
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("Failed to delete property: " + (err?.message ?? String(err)));
    }
  };

  /** Open approval modal – store normalized string id AND a stable ref */
  const handleApproval = (
    idOrObj: string | { _id?: string; id?: string } | null,
    title: string,
    currentStatus: "pending" | "approved" | "rejected" | "suspended" | "sold",
    targetStatus: "approved" | "rejected" | "suspended" | "sold"
  ) => {
    console.log("handleApproval called with:", { idOrObj, title, currentStatus, targetStatus });
    const id = normalizeId(idOrObj);
    console.log("Normalized ID in handleApproval:", id);
    if (!id) {
      console.error("handleApproval called with invalid id:", idOrObj);
      alert("Cannot open approval modal because property id is invalid.");
      return;
    }
    // store both in state and stable ref (to avoid races)
    currentApprovalIdRef.current = id;
    setApprovalModal({ isOpen: true, id, title, currentStatus, status: targetStatus });
    console.log("Modal state set:", { id, title, currentStatus, targetStatus });
  };

  /**
   * confirmApproval
   * - prefer explicit id arg (passed from modal usage)
   * - fallback to approvalModal.id
   * - fallback to currentApprovalIdRef.current (stable across renders)
   */
  async function confirmApproval(arg?: string | null): Promise<any> {
    console.log("confirmApproval called with:", { arg, modalId: approvalModal.id, refId: currentApprovalIdRef.current });
    const id = normalizeId(arg ?? approvalModal.id ?? currentApprovalIdRef.current);
    console.log("Normalized ID:", id);
    if (!id) {
      console.error("confirmApproval called without a valid id. approvalModal:", approvalModal, "arg:", arg, "ref:", currentApprovalIdRef.current);
      alert("No property selected for approval. Please re-open the modal and try again.");
      return null;
    }

    const safeId = encodeURIComponent(id);
    const url = `/api/admin/properties/${safeId}`;

    // Map status to action format expected by API
    const actionMap: Record<string, string> = {
      "approved": "approve",
      "rejected": "reject",
      "suspended": "suspend",
      "sold": "sold"
    };

    const payload = { action: actionMap[approvalModal.status] || approvalModal.status };

    // Log exactly what will be sent
    console.log("confirmApproval -> PATCH", url, "body:", payload);

    try {
      const res = await fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => null);
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      console.log("confirmApproval response:", res.status, parsed);

      if (!res.ok) {
        const msg = typeof parsed === "string" ? parsed : parsed?.error ?? parsed?.message;
        throw new Error(msg ? `Failed to update property (${res.status}): ${msg}` : `Failed to update property (${res.status})`);
      }

      // Update local properties state
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: approvalModal.status } : p))
      );

      // Close modal
      setApprovalModal({ isOpen: false, id: null, title: "", currentStatus: "pending", status: "approved" });
      return true;
    } catch (err: any) {
      console.error("Approval error:", err);
      alert("Failed to update property: " + (err?.message ?? String(err)));
      return false;
    }
  }

  const confirmRejection = (reason: string) => {
    if (approvalModal.id) {
      setProperties((prev) => prev.map((p) => (p._id === approvalModal.id ? { ...p, status: "rejected" } : p)));
      setApprovalModal({ isOpen: false, id: null, title: "", currentStatus: "pending", status: "approved" });
    }
  };

  const toggleVerification = async (id: string, currentVerified: boolean) => {
    try {
      console.log("Sending toggle request for:", id, "New verified status:", !currentVerified);
      const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: buildHeaders(),
        body: JSON.stringify({ verified: !currentVerified }),
      });

      console.log("Toggle response status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("Toggle failed response:", text);
        throw new Error(`Failed to update verification: ${text}`);
      }

      // Update local state
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, verified: !currentVerified } : p))
      );
    } catch (err: any) {
      console.error("Verification toggle error:", err);
      alert("Failed to update verification: " + (err?.message ?? String(err)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Properties Management</h1>
        <p className="text-muted-foreground">Manage all platform properties and approvals</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </Card>

      {/* Properties Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-light">
          <table className="w-full">
            <thead className="bg-blue-50/30">
              <tr className="">
                <th className="px-3 py-2 text-left text-xs font-semibold">Property</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Owner</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Price</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Views</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Verified</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredProperties.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    {error ?? "No properties found."}
                  </td>
                </tr>
              )}

              {filteredProperties.map((property) => (
                <tr 
                  key={property._id} 
                  className="hover:bg-blue-50/20 transition-colors cursor-pointer"
                  onClick={(e) => {
                    // Only navigate if not clicking on a button or link
                    if (!(e.target as HTMLElement).closest('button, a')) {
                      router.push(`/property/${property._id}`);
                    }
                  }}
                >
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{property.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{property.location}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      property.type === "rent" 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}>
                      {property.type === "rent" ? "Rent" : "Sale"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs truncate max-w-[100px]" title={property.ownerId}>{property.ownerId}</td>
                  <td className="px-3 py-2 text-sm font-semibold">${(property.price / 1000000).toFixed(1)}M</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Eye className="h-3 w-3" />
                      {property.views}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant={property.verified ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Verify toggle clicked for:", property._id, "Current verified:", property.verified);
                        toggleVerification(property._id, property.verified || false);
                      }}
                      className="h-7 w-7 p-0"
                      title={property.verified ? "Verified" : "Click to verify"}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                  <td className="px-3 py-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        property.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : property.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : property.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : property.status === "sold"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {property.status === "approved" && <CheckCircle className="h-3 w-3" />}
                      {property.status === "pending" && <Clock className="h-3 w-3" />}
                      {property.status === "rejected" && <AlertCircle className="h-3 w-3" />}
                      {property.status === "sold" && <DollarSign className="h-3 w-3" />}
                      {property.status === "suspended" && <Ban className="h-3 w-3" />}
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1 justify-center">
                        <Link href={`/property/${property._id}`}>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" title="View Details">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/properties/${property._id}/edit`}>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(property._id, property.title)} className="h-7 w-7 p-0" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {property.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(property._id, property.title, property.status, "approved")}
                          className="text-xs h-7"
                        >
                          Review
                        </Button>
                      )}
                      {property.status === "approved" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(property._id, property.title, property.status, "suspended")}
                            className="text-xs h-7 text-orange-600 hover:text-orange-700"
                          >
                            Suspend
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(property._id, property.title, property.status, "sold")}
                            className="text-xs h-7 text-blue-600 hover:text-blue-700"
                          >
                            Sold
                          </Button>
                        </div>
                      )}
                      {property.status === "suspended" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(property._id, property.title, property.status, "approved")}
                          className="text-xs h-7 text-green-600 hover:text-green-700"
                        >
                          Reactivate
                        </Button>
                      )}
                      {property.status === "sold" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(property._id, property.title, property.status, "approved")}
                          className="text-xs h-7 text-green-600 hover:text-green-700"
                        >
                          Unsell
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Property"
        description="This action cannot be undone. The property will be permanently deleted from the system."
        itemName={deleteModal.title}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, title: "" })}
      />

      <ApprovalModal
        isOpen={approvalModal.isOpen}
        title="Change Property Status"
        itemName={approvalModal.title}
        currentStatus={approvalModal.currentStatus}
        targetStatus={approvalModal.status}
        onApprove={confirmApproval}
        onReject={confirmRejection}
        onCancel={() => setApprovalModal({ isOpen: false, id: null, title: "", currentStatus: "pending", status: "approved" })}
      />
    </div>
  );
}

