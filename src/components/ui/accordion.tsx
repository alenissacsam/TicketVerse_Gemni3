"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  value: string | string[]
  onValueChange: (value: string) => void
}>({
  value: [],
  onValueChange: () => {},
})

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type?: "single" | "multiple"
    value?: string | string[]
    defaultValue?: string | string[]
    onValueChange?: (value: string | string[]) => void
  }
>(({ className, type = "single", value: controlledValue, defaultValue, onValueChange, ...props }, ref) => {
  const [value, setValue] = React.useState<string | string[]>(
    controlledValue || defaultValue || (type === "multiple" ? [] : "")
  )

  const handleValueChange = (itemValue: string) => {
    if (type === "multiple") {
      const current = Array.isArray(value) ? value : []
      const newValue = current.includes(itemValue)
        ? current.filter((v) => v !== itemValue)
        : [...current, itemValue]
      setValue(newValue)
      if (onValueChange) onValueChange(newValue)
    } else {
      const newValue = value === itemValue ? "" : itemValue
      setValue(newValue)
      if (onValueChange) onValueChange(newValue)
    }
  }

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div ref={ref} className={className} {...props} />
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn("border-b", className)} data-value={value} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, onValueChange } = React.useContext(AccordionContext)
  // @ts-ignore
  const itemValue = (props as any).parentNode?.getAttribute("data-value") || ""
  const isOpen = Array.isArray(value) ? value.includes(itemValue) : value === itemValue

  return (
    <h3 className="flex">
      <button
        ref={ref}
        onClick={() => onValueChange(itemValue)}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </h3>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value } = React.useContext(AccordionContext)
  // @ts-ignore
  const itemValue = (props as any).parentNode?.getAttribute("data-value") || ""
  const isOpen = Array.isArray(value) ? value.includes(itemValue) : value === itemValue

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
