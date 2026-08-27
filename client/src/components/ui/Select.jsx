import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * A fully themed dropdown to replace native <select> elements.
 *
 * Native <select> only lets you style the closed trigger - the open
 * options list is rendered by the OS/browser itself and ignores Tailwind
 * classes entirely, which is why selects looked dark-themed when closed
 * but showed a plain white list when opened. This component renders both
 * states itself, so it looks consistent everywhere (and in dark mode).
 *
 * Usage:
 *   <Select
 *     value={form.department}
 *     onChange={(value) => setForm({ ...form, department: value })}
 *     options={[{ value: 'a', label: 'Option A' }, ...]}
 *     placeholder="Select department"
 *   />
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  icon: Icon,
  className = '',
  size = 'md', // 'md' | 'sm'
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));
  const sizeClasses = size === 'sm' ? '!py-2 text-sm' : '';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`input w-full flex items-center justify-between gap-2 text-left ${sizeClasses} ${Icon ? 'pl-10' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
        <span className={`truncate ${selected ? '' : 'text-slate-400'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={15} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12152E] shadow-card py-1.5">
          {options.length === 0 ? (
            <p className="px-3.5 py-2 text-sm text-slate-400">No options</p>
          ) : (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left hover:bg-brand-50 dark:hover:bg-white/5 ${
                    isSelected ? 'text-brand-600 dark:text-brand-300 font-semibold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
