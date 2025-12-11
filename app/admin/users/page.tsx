"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingCard } from "@/components/loading-spinner"
import { ApprovalModal } from "@/components/approval-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

import {
  Search,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Clock,
  Ban,
  AlertCircle,
} from "lucide-react"

interface User {
  _id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: "user" | "agent" | "admin" | "investor"
  listings: number
  createdAt: string
  approved: boolean
  suspendedAt: string | null
  status: "pending" | "active" | "suspended" | "rejected"
}

interface PaginatedResponse {
  users: User[]
  total: number
  page: number
  limit: number
  pages: number
  currentUserId?: string
}

export default function AdminUsers() {
  // Table state
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "active" | "suspended" | "rejected">("all")
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(10)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: "",
  })
  const [roleModal, setRoleModal] = useState<{ isOpen: boolean; userId: string | null; currentRole: string; newRole: string }>({
    isOpen: false,
    userId: null,
    currentRole: "",
    newRole: "",
  })
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
    currentStatus: "pending" | "active" | "suspended" | "rejected";
    status: "active" | "rejected" | "suspended";
  }>({
    isOpen: false,
    id: null,
    name: "",
    currentStatus: "pending",
    status: "active",
  })
  const [actionLoading, setActionLoading] = useState(false)
  const currentApprovalIdRef = useRef<string | null>(null)

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [page, filterRole, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      })
      if (searchTerm) params.append("search", searchTerm)
      if (filterRole !== "all") params.append("role", filterRole)

      const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      const data: PaginatedResponse = await res.json()
      // Compute status for each user
      const usersWithStatus = data.users.map(u => ({
        ...u,
        status: getUserStatus(u)
      }))
      setUsers(usersWithStatus)
      setTotal(data.total)
      setTotalPages(data.pages)
      if (data.currentUserId) {
        setCurrentUserId(data.currentUserId)
      }
    } catch (err: any) {
      console.error("Error fetching users:", err)
      setError(err.message || "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    try {
      setActionLoading(true)
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteModal.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to delete" }))
        throw new Error(err?.error || "Delete failed")
      }
      setUsers(users.filter((u) => u._id !== deleteModal.id))
      setDeleteModal({ isOpen: false, id: null, name: "" })
    } catch (err: any) {
      console.error("Error deleting user:", err)
      alert(`Failed to delete user: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!roleModal.userId || !roleModal.newRole) return
    try {
      setActionLoading(true)
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: roleModal.userId, role: roleModal.newRole }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to update" }))
        throw new Error(err?.error || "Role change failed")
      }
      setUsers(users.map((u) => (u._id === roleModal.userId ? { ...u, role: roleModal.newRole as any } : u)))
      setRoleModal({ isOpen: false, userId: null, currentRole: "", newRole: "" })
    } catch (err: any) {
      console.error("Error updating role:", err)
      alert(`Failed to update role: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  /** Normalize id-like values to string or null */
  function normalizeId(val: unknown): string | null {
    if (val == null) return null
    if (typeof val === "string") return val.trim() || null
    if (typeof val === "number") return String(val)
    if (typeof val === "object") {
      const obj = val as any
      if (obj._id != null) {
        if (typeof obj._id === "string") return obj._id.trim() || null
        return String(obj._id)
      }
      if (obj.id != null) {
        if (typeof obj.id === "string") return obj.id.trim() || null
        return String(obj.id)
      }
    }
    try {
      const str = String(val)
      return str !== "[object Object]" ? str : null
    } catch {
      return null
    }
  }

  /** Get user status based on approved and suspendedAt */
  const getUserStatus = (user: User): "pending" | "active" | "suspended" | "rejected" => {
    if (user.suspendedAt) return "suspended"
    if (user.approved === false) return "pending"
    if (user.approved === true) return "active"
    return "pending"
  }

  /** Handle approval modal opening */
  const handleApproval = (
    idOrObj: string | { _id?: string; id?: string } | null,
    name: string,
    currentStatus: "pending" | "active" | "suspended" | "rejected",
    targetStatus: "active" | "rejected" | "suspended"
  ) => {
    const id = normalizeId(idOrObj)
    if (!id) {
      alert("Cannot open approval modal because user id is invalid.")
      return
    }
    currentApprovalIdRef.current = id
    setApprovalModal({ isOpen: true, id, name, currentStatus, status: targetStatus })
  }

  /** Confirm approval/rejection/suspension */
  async function confirmApproval(arg?: string | null): Promise<any> {
    console.log("confirmApproval called with:", { arg, modalId: approvalModal.id, refId: currentApprovalIdRef.current })
    const id = normalizeId(arg ?? approvalModal.id ?? currentApprovalIdRef.current)
    console.log("Normalized ID:", id)
    if (!id) {
      console.error("confirmApproval called without a valid id. approvalModal:", approvalModal, "arg:", arg, "ref:", currentApprovalIdRef.current)
      alert("No user selected for approval. Please re-open the modal and try again.")
      return null
    }

    try {
      setActionLoading(true)

      // Map status to API payload
      let payload: any = { userId: id }
      if (approvalModal.status === "active") {
        payload.approved = true
        payload.suspended = false
      } else if (approvalModal.status === "rejected") {
        payload.approved = false
      } else if (approvalModal.status === "suspended") {
        payload.suspended = true
      }

      console.log("confirmApproval -> PATCH /api/admin/users, body:", payload)

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const text = await res.text().catch(() => null)
      let parsed: any = null
      try {
        parsed = text ? JSON.parse(text) : null
      } catch {
        parsed = text
      }
      console.log("confirmApproval response:", res.status, parsed)

      if (!res.ok) {
        const msg = typeof parsed === "string" ? parsed : parsed?.error ?? parsed?.message
        throw new Error(msg ? `Failed to update user (${res.status}): ${msg}` : `Failed to update user (${res.status})`)
      }

      // Update local state
      setUsers(users.map((u) => {
        if (u._id === id) {
          const updated = { ...u }
          if (approvalModal.status === "active") {
            updated.approved = true
            updated.suspendedAt = null
          } else if (approvalModal.status === "rejected") {
            updated.approved = false
          } else if (approvalModal.status === "suspended") {
            updated.suspendedAt = new Date().toISOString()
          }
          updated.status = getUserStatus(updated)
          return updated
        }
        return u
      }))

      setApprovalModal({ isOpen: false, id: null, name: "", currentStatus: "pending", status: "active" })
      return true
    } catch (err: any) {
      console.error("Approval error:", err)
      alert(`Failed to update user: ${err.message}`)
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const confirmRejection = (reason: string) => {
    if (approvalModal.id) {
      setUsers(users.map((u) => (u._id === approvalModal.id ? { ...u, approved: false, status: "rejected" } : u)))
      setApprovalModal({ isOpen: false, id: null, name: "", currentStatus: "pending", status: "active" })
    }
  }

  if (loading && users.length === 0) {
    return <LoadingCard />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage all platform users and permissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-10" />
        </div>
        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-md">
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="agent">Agent</option>
          <option value="investor">Investor</option>
          <option value="admin">Admin</option>
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as any); setPage(1); }} className="px-3 py-2 border rounded-md">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {/* Users Table */}
      <div className="rounded-lg overflow-x-auto scrollbar-light shadow-md">
        <table className="w-full">
          <thead className="bg-blue-50/30">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Name</th>
              <th className="text-left px-6 py-3 font-semibold">Email</th>
              <th className="text-left px-6 py-3 font-semibold">Phone</th>
              <th className="text-left px-6 py-3 font-semibold">Role</th>
              <th className="text-center px-6 py-3 font-semibold">Listings</th>
              <th className="text-left px-6 py-3 font-semibold">Status</th>
              <th className="text-left px-6 py-3 font-semibold">Joined</th>
              <th className="text-right px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => filterStatus === "all" || u.status === filterStatus).length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-600">No users found</td></tr>
            ) : (
              users.filter(u => filterStatus === "all" || u.status === filterStatus).map((user) => {
                const isCurrentUser = currentUserId === user._id
                return (
                  <tr key={user._id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{user.firstName}</div>
                        {isCurrentUser && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{user.phone || "-"}</td>
                    <td className="px-6 py-4"><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user.role === "admin" ? "bg-red-100 text-red-800" : user.role === "agent" ? "bg-blue-100 text-blue-800" : user.role === "investor" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
                    <td className="px-6 py-4 text-center">{user.listings}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${user.status === "active" ? "bg-green-100 text-green-800" :
                        user.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          user.status === "suspended" ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                        }`}>
                        {user.status === "active" && <CheckCircle className="h-3 w-3" />}
                        {user.status === "pending" && <Clock className="h-3 w-3" />}
                        {user.status === "suspended" && <Ban className="h-3 w-3" />}
                        {user.status === "rejected" && <AlertCircle className="h-3 w-3" />}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproval(user._id, user.firstName, user.status, "active")}
                              disabled={actionLoading || isCurrentUser}
                              className="text-xs"
                              title={isCurrentUser ? "Cannot modify your own account" : ""}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproval(user._id, user.firstName, user.status, "rejected")}
                              disabled={actionLoading || isCurrentUser}
                              className="text-xs text-red-600 hover:text-red-700"
                              title={isCurrentUser ? "Cannot modify your own account" : ""}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {user.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproval(user._id, user.firstName, user.status, "suspended")}
                            disabled={actionLoading || isCurrentUser}
                            className="text-xs text-orange-600 hover:text-orange-700"
                            title={isCurrentUser ? "Cannot modify your own account" : ""}
                          >
                            Suspend
                          </Button>
                        )}
                        {user.status === "suspended" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproval(user._id, user.firstName, user.status, "active")}
                            disabled={actionLoading || isCurrentUser}
                            className="text-xs text-green-600 hover:text-green-700"
                            title={isCurrentUser ? "Cannot modify your own account" : ""}
                          >
                            Reactivate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRoleModal({ isOpen: true, userId: user._id, currentRole: user.role, newRole: user.role })}
                          disabled={actionLoading || isCurrentUser}
                          title={isCurrentUser ? "Cannot modify your own account" : ""}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user._id, user.firstName)}
                          disabled={actionLoading || isCurrentUser}
                          className="text-red-600 hover:text-red-700"
                          title={isCurrentUser ? "Cannot delete your own account" : ""}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} users</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading}>Previous</Button>
            <span className="px-4 py-2">Page {page} of {totalPages}</span>
            <Button variant="outline" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || loading}>Next</Button>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete User"
        description="This action cannot be undone. The user will be permanently deleted from the system."
        itemName={deleteModal.name}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
      />

      <ApprovalModal
        isOpen={approvalModal.isOpen}
        title="Change User Status"
        itemName={approvalModal.name}
        currentStatus={approvalModal.currentStatus}
        targetStatus={approvalModal.status}
        onApprove={() => confirmApproval(approvalModal.id)}
        onReject={confirmRejection}
        onCancel={() => setApprovalModal({ isOpen: false, id: null, name: "", currentStatus: "pending", status: "active" })}
      />

      {/* Role Modal */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Change User Role</h2>
            <select value={roleModal.newRole} onChange={(e) => setRoleModal({ ...roleModal, newRole: e.target.value })} className="w-full border p-2 rounded">
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="investor">Investor</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setRoleModal({ isOpen: false, userId: null, currentRole: "", newRole: "" })} disabled={actionLoading}>Cancel</Button>
              <Button onClick={handleRoleChange} disabled={actionLoading}>
                {actionLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
