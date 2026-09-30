"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [count, setCount] = useState(0);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">ChatGPT Clone coming soon</h1>
      <Button onClick={() => setCount(count + 1)}>Clicked {count} times</Button>
    </main>
  );
}
