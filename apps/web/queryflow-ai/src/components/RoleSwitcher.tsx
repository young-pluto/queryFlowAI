import { Button } from '@/components/ui/button'
import { useRoleStore } from '@/store/useRoleStore'

const roles = [
  { label: 'User', value: 'user' as const },
  { label: 'Admin', value: 'admin' as const },
]

export function RoleSwitcher() {
  const { role, setRole } = useRoleStore()

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
      {roles.map(({ label, value }) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={role === value ? 'default' : 'ghost'}
          className="h-8 min-w-[72px]"
          aria-pressed={role === value}
          onClick={() => setRole(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

