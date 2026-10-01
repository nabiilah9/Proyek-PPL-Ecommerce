"use client"

import type React from "react"

import { PlusCircle } from "lucide-react"
import { Button } from "@/components/elements/button"

interface HoldPatternProps {
  title: string
  description: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export default function HoldPattern({ title, description, icon, actionLabel, onAction }: HoldPatternProps) {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        {icon || <PlusCircle className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}