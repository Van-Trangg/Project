import { api } from './apiClient'

export const getProfile = () => api.get('/profile')

// Attempt to update profile on backend (if supported). Returns a promise.
export const updateProfile = (data) => api.put('/profile', data)

// If caller needs to upload a file (avatar), send multipart/form-data. `data` can be
// an object with fields and possibly `avatar` as a File. Returns an axios promise.
export const updateProfileMultipart = (data) => {
	const fd = new FormData()
	Object.keys(data || {}).forEach(key => {
		const val = data[key]
		if (val === undefined || val === null) return
		// For arrays/objects you may need custom handling; for now we append primitives and Files
		if (val instanceof File) {
			fd.append(key, val)
		} else {
			fd.append(key, String(val))
		}
	})
	return api.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}