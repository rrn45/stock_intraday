import { useState } from "react";
import type { FormEvent } from "react";

interface SymbolFormProps {
  onSubmit: (symbol: string) => void;
  disabled?: boolean;
}

export function SymbolForm({ onSubmit, disabled }: SymbolFormProps) {
  const [symbol, setSymbol] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = symbol.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Enter a stock symbol (e.g. TSLA)"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled}>
        Search
      </button>
    </form>
  );
}
