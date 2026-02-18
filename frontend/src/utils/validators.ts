export function validateService(form: any): string | null {
  if (!form) return 'Dados inválidos';
  if (!form.name || String(form.name).trim().length < 3) return 'Nome muito curto';
  if (!form.description || String(form.description).trim().length < 10) return 'Descrição muito curta';
  if (isNaN(Number(form.basePrice)) || Number(form.basePrice) < 0) return 'Preço inválido';
  if (isNaN(Number(form.durationMinutes)) || Number(form.durationMinutes) <= 0) return 'Duração inválida';
  return null;
}

export function validateAuth(email: string, password: string): string | null {
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Email inválido';
  if (!password || String(password).length < 6) return 'Senha muito curta (mínimo 6 caracteres)';
  return null;
}

export function validateRegister(data: { name?: string; email?: string; password?: string; confirmPassword?: string; phone?: string; }): string | null {
  if (!data.name || String(data.name).trim().length < 3) return 'Nome muito curto';
  const authErr = validateAuth(data.email || '', data.password || '');
  if (authErr) return authErr;
  if (data.password !== data.confirmPassword) return 'Senhas não correspondem';
  return null;
}

export function validateBooking(payload: { bookingDate?: string; address?: string; notes?: string; }): string | null {
  if (!payload.bookingDate) return 'Data do agendamento é obrigatória';
  const date = new Date(payload.bookingDate!);
  if (isNaN(date.getTime())) return 'Data inválida';
  if (date.getTime() < Date.now() - 60_000) return 'A data deve ser no futuro';
  if (!payload.address || String(payload.address).trim().length < 5) return 'Endereço inválido';
  return null;
}
