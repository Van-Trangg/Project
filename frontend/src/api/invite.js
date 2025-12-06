import { api } from './apiClient'

// Backend exposes /invite-info which returns my_referral_code and invitees
export const getInvite = () => api.get('/users/invite-info')

// keep a separate call if you later want a dedicated claims endpoint
export const getInviteClaims = () => api.get('/invite-info')

export const createInvite = (data) => api.post('/invite', data)
