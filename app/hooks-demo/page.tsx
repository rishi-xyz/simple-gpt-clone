"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// A scratch page for Phase 04: every hook and event you need for the chat app.
// Open http://localhost:3000/hooks-demo and edit this file while it runs.
export default function HooksDemo() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 p-8">
      <h1 className="text-3xl font-semibold">Hooks & events playground</h1>
      <CounterDemo />
      <ControlledInputDemo />
      <ListDemo />
      <EffectDemo />
      <RefDemo />
    </main>
  );
}

// ---------------------------------------------------------------- useState
function CounterDemo() {
  const [count, setCount] = useState(0);

  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-medium">1. useState</h2>
      <p className="text-sm text-muted-foreground">
        Clicked <strong>{count}</strong> times.
      </p>
      <div className="flex gap-2">
        {/* Direct: reads the CURRENT count */}
        <Button onClick={() => setCount(count + 1)}>+1</Button>

        {/* Function form: reads the LATEST count. Only this one adds 2. */}
        <Button variant="outline" onClick={() => { setCount((c) => c + 1); setCount((c) => c + 1); }}>
          +2 (function form)
        </Button>

        {/* The bug: both read the same stale value, so this adds 1, not 2 */}
        <Button variant="outline" onClick={() => { setCount(count + 1); setCount(count + 1); }}>
          +2 (buggy)
        </Button>

        <Button variant="ghost" onClick={() => setCount(0)}>Reset</Button>
      </div>
    </section>
  );
}

// ------------------------------------------------- controlled input + events
function ControlledInputDemo() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState<string[]>([]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();                 // stop the page reloading
    if (!text.trim()) return;
    setSubmitted([...submitted, text]);  // new array, not .push()
    setText("");
  }

  // Exactly how the real chat box works
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-medium">2. Controlled input + events</h2>
      <form onSubmit={handleSubmit} className="grid gap-2">
        <textarea
          value={text}                                 // state → input
          onChange={(e) => setText(e.target.value)}    // input → state
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Type, then press Enter (Shift+Enter for a new line)"
          className="rounded-md border p-2 text-sm"
        />
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!text.trim()}>Send</Button>
          <span className="text-sm text-muted-foreground">{text.length} characters</span>
        </div>
      </form>
      <ul className="text-sm text-muted-foreground">
        {submitted.map((s, i) => <li key={i}>• {s}</li>)}
      </ul>
    </section>
  );
}

// ------------------------------------------------- map / filter over state
function ListDemo() {
  const [chats, setChats] = useState([
    { id: "c1", title: "Pasta recipe", messages: 4 },
    { id: "c2", title: "Learn TypeScript", messages: 0 },
    { id: "c3", title: "Debug my code", messages: 12 },
  ]);
  const [onlyBusy, setOnlyBusy] = useState(false);

  // filter decides what to show; map turns each one into UI
  const visible = onlyBusy ? chats.filter((c) => c.messages > 0) : chats;
  const total = chats.reduce((sum, c) => sum + c.messages, 0);

  function remove(id: string) {
    setChats(chats.filter((c) => c.id !== id));   // new array → re-render
  }

  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-medium">3. map / filter / reduce in UI</h2>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={onlyBusy} onChange={(e) => setOnlyBusy(e.target.checked)} />
        Hide empty chats
      </label>
      <ul className="grid gap-1">
        {visible.map((chat) => (
          <li key={chat.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{chat.title} · {chat.messages} messages</span>
            <button onClick={() => remove(chat.id)} className="text-destructive">delete</button>
          </li>
        ))}
        {visible.length === 0 && <li className="text-sm text-muted-foreground">Nothing to show</li>}
      </ul>
      <p className="text-sm text-muted-foreground">{total} messages across all chats (reduce)</p>
    </section>
  );
}

// ---------------------------------------------------------------- useEffect
function EffectDemo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);   // cleanup: without this the timer leaks
  }, [running]);                         // re-runs whenever `running` changes

  // Watch your browser tab title change
  useEffect(() => {
    document.title = running ? `⏱ ${seconds}s` : "Hooks demo";
  }, [seconds, running]);

  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-medium">4. useEffect (+ cleanup)</h2>
      <p className="text-sm text-muted-foreground">{seconds} seconds — check the tab title too.</p>
      <div className="flex gap-2">
        <Button onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</Button>
        <Button variant="ghost" onClick={() => setSeconds(0)}>Reset</Button>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ useRef
function RefDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef(0);        // changing this does NOT re-render
  const [, forceRender] = useState(0);

  renderCount.current += 1;

  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-medium">5. useRef</h2>
      <input ref={inputRef} placeholder="I can be focused from code" className="rounded-md border p-2 text-sm" />
      <div className="flex gap-2">
        <Button onClick={() => inputRef.current?.focus()}>Focus the input</Button>
        <Button variant="outline" onClick={() => forceRender((n) => n + 1)}>Re-render</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Rendered {renderCount.current} times — a ref survives renders without causing them.
      </p>
    </section>
  );
}
