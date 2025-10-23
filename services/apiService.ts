const API_URL = import.meta.env.VITE_API_URL;

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/api/users`);
  if (!response.ok) throw new Error('Gagal mengambil data pengguna');
  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Gagal mendaftarkan pengguna');
  return response.json();
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login gagal');
  return response.json();
};
