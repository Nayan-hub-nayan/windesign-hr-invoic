import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'

export function TopBar() {
  const { user, signOut } = useAuth()

  return (
    <div className="bg-green text-white border-b-[3px] border-gold">
      <div className="max-w-[1280px] mx-auto px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="font-playfair text-xl tracking-wide">
          <div>Windesign</div>
          <div className="font-serif text-[10px] tracking-[3px] uppercase opacity-70 mt-0.5">
            HR & Invoice Suite
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2.5">
              {user.picture && (
                <img
                  src={user.picture}
                  alt=""
                  className="w-7 h-7 rounded-full border border-white/30"
                />
              )}
              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-serif leading-tight">{user.name}</div>
                <div className="text-[9px] opacity-70 font-serif">{user.email}</div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={signOut}
            className="text-[10px] tracking-[1.5px] uppercase opacity-80 font-serif border border-white/30 px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

interface NavProps {
  active: string
  onChange: (tab: string) => void
  tabs: { id: string; label: string }[]
}

export function Nav({ active, onChange, tabs }: NavProps) {
  return (
    <div className="bg-card border-b border-line px-8 flex gap-0 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`bg-transparent border-none py-[15px] px-5 text-xs font-serif tracking-wide cursor-pointer border-b-[3px] whitespace-nowrap transition-[color,border-color] duration-150 ${
            active === tab.id
              ? 'text-green border-gold font-semibold'
              : 'text-muted border-transparent hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function FormPanel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="bg-card border border-line p-[26px]">
      <h2 className="font-playfair text-lg font-bold text-green mb-1">{title}</h2>
      {subtitle && (
        <p className="text-[11px] text-muted mb-5 leading-normal italic">{subtitle}</p>
      )}
      {children}
    </div>
  )
}

export function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#c8c4bc] p-6 overflow-auto max-h-[86vh]">{children}</div>
  )
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex border border-green overflow-hidden mb-[18px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 bg-transparent border-none py-2.5 text-xs font-serif cursor-pointer text-green transition-colors duration-150 ${
            value === opt.value ? 'bg-green text-white' : ''
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Fieldset({
  legend,
  children,
  className = '',
}: {
  legend: string
  children: ReactNode
  className?: string
}) {
  return (
    <fieldset className={`border-none mb-[18px] ${className}`}>
      <legend className="text-[9px] tracking-[2px] uppercase text-gold font-semibold mb-2.5 block pb-1.5 border-b border-line w-full">
        {legend}
      </legend>
      {children}
    </fieldset>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] text-muted my-2.5 mb-[3px] italic">{children}</label>
  )
}

const inputClass =
  'w-full py-2 px-2.5 border border-line text-xs font-serif bg-white text-ink rounded-sm transition-[border-color] duration-150 focus:outline-none focus:border-green'

export function TextInput({
  value,
  onChange,
  readOnly,
  type = 'text',
  className = '',
}: {
  value: string | number
  onChange?: (v: string) => void
  readOnly?: boolean
  type?: string
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={`${inputClass} ${readOnly ? 'bg-green-light font-bold text-green' : ''} ${className}`}
    />
  )
}

export function TextArea({
  value,
  onChange,
  rows = 2,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  )
}

export function SelectInput({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${className}`}
    >
      {children}
    </select>
  )
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <div className="bg-green-light border-l-[3px] border-gold py-2.5 px-[13px] text-[11px] text-green mb-4 italic">
      {children}
    </div>
  )
}

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-[18px] pt-[18px] border-t border-line">
      {children}
    </div>
  )
}

export function BtnPrimary({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`col-span-2 py-[11px] border-none text-xs font-semibold cursor-pointer font-serif tracking-wide transition-colors duration-150 bg-green text-white hover:bg-green-dark ${className}`}
    >
      {children}
    </button>
  )
}

export function BtnSecondary({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-[11px] border border-green text-xs font-semibold cursor-pointer font-serif tracking-wide transition-colors duration-150 bg-white text-green hover:bg-green-light ${className}`}
    >
      {children}
    </button>
  )
}

export function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>
}

export function ThreeCol({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-3 gap-2">{children}</div>
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="text-center py-20 px-8 text-muted">
      <h2 className="font-playfair text-green text-[22px] mb-2.5">{title}</h2>
      <p>Coming next.</p>
    </div>
  )
}
