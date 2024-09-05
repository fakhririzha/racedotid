'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as dayjs from 'dayjs';
// import {
//     DropdownMenu,
//     DropdownMenuCheckboxItem,
//     DropdownMenuContent,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
// import { ChevronDown } from "lucide-react";
import * as React from 'react';

export const columns = [
    {
        accessorKey: "tamaId",
        header: "TamaID",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("tamaId")}</div>
        ),
    },
    {
        accessorKey: "Latitude",
        header: "Latitude",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("Latitude")}</div>
        ),
    },
    {
        accessorKey: "Longitude",
        header: "Longitude",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("Longitude")}</div>
        ),
    },
    {
        accessorKey: "ReceivedTime",
        header: "ReceivedTime",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("ReceivedTime")}</div>
        ),
    },
    {
        accessorKey: "CapturedTime",
        header: "CapturedTime",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("CapturedTime")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const col = row.original;

            if (col.CapturedTime === null) {
                return <Badge variant="secondary">NO DATA</Badge>
            }

            let capturedTime = dayjs(col.CapturedTime);
            let nowTime = dayjs(Date.now());
            const timeDiff = nowTime.diff(capturedTime, 'minutes');

            if (timeDiff > 30) {
                return <Badge variant="destructive">DATA LAMA</Badge>
            } else {
                return <Badge>OK</Badge>
            }
        },
    },
]

const Status = () => {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [statusData, setStatusData] = React.useState([]);

    const table = useReactTable({
        data: statusData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const fetchData = async () => {
        console.log('fetching data...');
        const status = await fetch('https://map.race.id/api/status');
        const statusJson = await status.json();
        setStatusData(statusJson);
    };
    React.useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <main className="status flex">
            <section className="sidebar basis-2/12 bg-primary p-4 max-sm:hidden">
                <div className="title-wrapper my-2 text-center">
                    <span className="text-xl font-bold text-white">
                        Status Table.
                    </span>
                </div>
                <Separator />
            </section>
            <section className="map basis-10/12 h-[100vh] p-4 max-sm:basis-full max-sm:max-w-[100vw]">
                <div className="flex items-center pb-4">
                    <Input
                        placeholder="Filter TamaID..."
                        value={(table.getColumn("tamaId")?.getFilterValue()) ?? ""}
                        onChange={(event) =>
                            table.getColumn("tamaId")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu> */}
                </div>
                <div className="rounded-md border">
                    {statusData && <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>}
                </div>
                {statusData && <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>}
            </section>
        </main>
    )
}

export default Status;