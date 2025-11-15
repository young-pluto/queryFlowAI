import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Role = 'user' | 'admin'

type RoleStore = {
  role: Role
  setRole: (role: Role) => void
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      role: 'user',
      setRole: (role) => set({ role }),
    }),
    { name: 'queryflow-role' },
  ),
)

