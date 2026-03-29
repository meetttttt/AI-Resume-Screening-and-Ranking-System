"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { Database, Search, User, ChevronLeft, ChevronRight, Eye, AlertCircle } from "lucide-react"

import { CandidateDetail } from "@/components/candidate-detail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listSavedCandidates, type SavedCandidateListRow } from "@/lib/list-saved-candidates"

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 350

function screenerLabel(row: SavedCandidateListRow): string {
  if (row.screenedByEmail) return row.screenedByEmail
  if (row.screenedByUserId) return `User ${row.screenedByUserId.slice(0, 8)}…`
  return "Unknown"
}

interface ScreenedCandidatesTabProps {
  isActive: boolean
}

export function ScreenedCandidatesTab({ isActive }: ScreenedCandidatesTabProps) {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<SavedCandidateListRow[]>([])
  const [total, setTotal] = useState(0)
  const [rpcAvailable, setRpcAvailable] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notConfigured, setNotConfigured] = useState(false)
  const [detail, setDetail] = useState<SavedCandidateListRow | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    setNotConfigured(false)
    try {
      const res = await listSavedCandidates(page, PAGE_SIZE, debouncedSearch)
      if (!res.ok) {
        if (res.reason === "not_configured") {
          setNotConfigured(true)
          setRows([])
          setTotal(0)
        } else if (res.reason === "not_signed_in") {
          setErrorMessage("Your session expired. Refresh the page or sign in again.")
          setRows([])
          setTotal(0)
        } else {
          setErrorMessage(res.message)
          setRows([])
          setTotal(0)
        }
        return
      }
      setRows(res.rows)
      setTotal(res.total)
      setRpcAvailable(res.rpcAvailable)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Failed to load candidates")
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    if (!isActive) return
    void load()
  }, [isActive, load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-none shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6 text-indigo-500" />
                Screened candidates
              </CardTitle>
              <CardDescription>
                Every signed-in teammate sees the same history. Each row shows who ran that screening. Search and
                pagination run on the server.
              </CardDescription>
            </div>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
            <Input
              type="search"
              placeholder="Search by candidate, job, or screener email…"
              className="h-11 pl-10 rounded-full border-indigo-100 bg-white"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search screened candidates"
            />
          </div>

          {!rpcAvailable && (
            <div
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900"
              role="status"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Optional: run{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
                  supabase/migrations/20250329120000_list_saved_candidates_rpc.sql
                </code>{" "}
                in the Supabase SQL editor for the recommended list + search function.
              </span>
            </div>
          )}

          {notConfigured && (
            <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4 bg-muted/30">
              Supabase is not configured. Add{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (or publishable key) in{" "}
              <code className="text-xs">.env.local</code> to load saved candidates.
            </p>
          )}

          {errorMessage && (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : rows.length === 0 && !notConfigured ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                <User className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="font-medium text-foreground">No saved candidates yet</p>
              <p className="mt-1 max-w-md text-sm">
                Complete a screening run with database saving enabled. Rows appear here after analysis finishes.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {(page - 1) * PAGE_SIZE + rows.length} of {total}
                </span>
                <span>
                  Page {page} of {totalPages}
                </span>
              </div>

              <div className="rounded-lg border border-indigo-100/80 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-50/50 hover:bg-indigo-50/50">
                      <TableHead className="whitespace-nowrap">Screened</TableHead>
                      <TableHead className="min-w-[120px] max-w-[200px]">Screener</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead className="hidden md:table-cell">Job</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Match</TableHead>
                      <TableHead className="w-[100px] text-right">Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id} className="group">
                        <TableCell className="whitespace-nowrap text-muted-foreground align-top">
                          {format(new Date(r.createdAt), "MMM d, yyyy")}
                          <span className="hidden sm:inline text-xs block text-muted-foreground/80">
                            {format(new Date(r.createdAt), "h:mm a")}
                          </span>
                        </TableCell>
                        <TableCell className="align-top max-w-[200px]">
                          <span className="text-sm truncate block" title={screenerLabel(r)}>
                            {screenerLabel(r)}
                          </span>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="font-medium">{r.candidate.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                            {r.candidate.email}
                          </div>
                          <div className="mt-1 md:hidden text-xs text-muted-foreground line-clamp-2">
                            {r.jobRequirements.jobTitle}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell align-top max-w-[240px]">
                          <span className="line-clamp-2 text-sm">{r.jobRequirements.jobTitle}</span>
                        </TableCell>
                        <TableCell className="text-right align-top whitespace-nowrap">
                          <span
                            className={
                              r.candidate.matchScore > 85
                                ? "font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500"
                                : r.candidate.matchScore > 70
                                  ? "font-semibold text-indigo-600"
                                  : "font-medium text-foreground"
                            }
                          >
                            {Math.round(r.candidate.matchScore)}%
                          </span>
                          {r.uiSnapshot.isTopMatch && (
                            <Badge className="ml-2 hidden lg:inline-flex bg-gradient-to-r from-pink-100 to-indigo-100 text-indigo-800 border-0">
                              Top
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-indigo-200 hover:bg-indigo-50"
                            onClick={() => setDetail(r)}
                          >
                            <Eye className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-indigo-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-indigo-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-6 pb-2 shrink-0 text-left">
            <SheetTitle>Candidate detail</SheetTitle>
            <SheetDescription>
              {detail
                ? `${detail.candidate.name} · ${format(new Date(detail.createdAt), "MMM d, yyyy")} · by ${screenerLabel(detail)}`
                : ""}
            </SheetDescription>
          </SheetHeader>
          {detail && (
            <ScrollArea className="flex-1 px-6 pb-6">
              <CandidateDetail candidate={detail.candidate} jobRequirements={detail.jobRequirements} />
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
