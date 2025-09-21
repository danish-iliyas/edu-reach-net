"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell
} from "@/components/ui/table"

interface StateStat {
  id: string
  name: string
  districts: number
  blocks: number
  schools: number
}

interface StateWiseTableProps {
  data: StateStat[]
}

export function StateWiseTable({ data }: StateWiseTableProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const rowsPerPage = 6

  // 🔎 Filter states by search
  const filteredStates = useMemo(() => {
    return data.filter((state) =>
      state.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, data])

  // 📑 Paginated data
  const paginatedStates = filteredStates.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  )

  return (
    <Card className="backdrop-blur-sm bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        {/* Left: Title + Desc */}
        <div>
          <CardTitle>State-wise Distribution</CardTitle>
          <CardDescription>
            School and infrastructure breakdown by state
          </CardDescription>
        </div>

        {/* Right: Search */}
        <Input
          type="text"
          placeholder="Search state..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="max-w-xs"
        />
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-center">Districts</TableHead>
              <TableHead className="text-center">Blocks</TableHead>
              <TableHead className="text-center">Schools</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStates.map((state, index) => (
              <TableRow key={state.id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell className="font-medium">{state.name}</TableCell>
                <TableCell className="text-center">{state.districts}</TableCell>
                <TableCell className="text-center">{state.blocks}</TableCell>
                <TableCell className="text-center">{state.schools}</TableCell>
              </TableRow>
            ))}

            {paginatedStates.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No states found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={(page + 1) * rowsPerPage >= filteredStates.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
