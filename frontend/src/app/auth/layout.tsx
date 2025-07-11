import React from "react"

interface Props {
    children: React.ReactNode;
}
export default function layout({children}: Props) {
  return (
    <div className="bg-muted flex flex-col items-center justify-center min-h-svh p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        {children}
      </div>
    </div>
  )
}
