import api from '@/lib/axios'

export interface UpdateNameRequest {
  name: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface DeleteAccountRequest {
  userId: string
}

export const accountService = {
  async updateName(data: UpdateNameRequest) {
    const response = await api.put('/api/users/profile', data)
    return response.data
  },

  async updatePassword(data: UpdatePasswordRequest) {
    const response = await api.put('/api/users/profile', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    })
    return response.data
  },

  async deleteAccount(data: DeleteAccountRequest) {
    const response = await api.delete(`/api/users/${data.userId}`)
    return response.data
  },
}
