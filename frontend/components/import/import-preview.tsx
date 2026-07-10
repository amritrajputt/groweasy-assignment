"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface ImportPreviewProps {
  headers: string[];
  data: string[][];
}

export function ImportPreview({ headers, data }: ImportPreviewProps) {
  if (data.length === 0) return null;

  return (
    <div className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          CSV File Preview (First 5 rows)
        </span>
        <span className="text-[10px] text-sky-500 font-semibold">
          Review structure before importing
        </span>
      </div>
      <div className="overflow-x-auto max-h-48">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-100/50 dark:bg-neutral-900/50">
              {headers.map((header, index) => (
                <TableHead key={index} className="text-[11px] py-1.5 font-bold text-neutral-800 dark:text-neutral-300">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-[11px] py-1.5 font-normal text-neutral-600 dark:text-neutral-400 truncate max-w-[150px]">
                    {cell || <span className="text-neutral-300">—</span>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
