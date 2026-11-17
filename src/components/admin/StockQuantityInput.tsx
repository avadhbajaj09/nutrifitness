'use client';

import { useEffect, useRef, useState } from 'react';

export default function StockQuantityInput({ value, onCommit, disabled, title, className }: {
  value: number;
  onCommit: (quantity: number) => Promise<void>;
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  useEffect(() => { setDraft(String(value)); }, [value]);

  const commit = async () => {
    if (pending.current || disabled || draft === String(value)) return;
    const quantity = Number(draft);
    if (!draft.trim() || !Number.isSafeInteger(quantity) || quantity < 0) {
      setDraft(String(value));
      return;
    }
    pending.current = true;
    setSaving(true);
    try { await onCommit(quantity); }
    finally { pending.current = false; setSaving(false); }
  };

  return <input type="number" min={0} step={1} aria-label="Quantité en stock"
    value={draft} disabled={disabled || saving} title={title} className={className}
    onChange={event => setDraft(event.target.value)} onBlur={commit}
    onKeyDown={event => {
      if (event.key === 'Enter') event.currentTarget.blur();
      if (event.key === 'Escape') { setDraft(String(value)); }
    }} />;
}
