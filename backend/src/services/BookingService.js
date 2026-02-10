/**
 * Booking Service
 * Lógica de negócio para agendamentos
 */

const { getDb } = require('../db/sqlite');

class BookingService {
  /**
   * Criar agendamento com validações
   */
  async createBooking(bookingData) {
    try {
      // Validar dados
      this.validateBookingData(bookingData);

      // Verificar conflitos
      const hasConflict = await this.checkForConflicts(
        bookingData.date,
        bookingData.teamMemberId
      );

      if (hasConflict) {
        throw new Error('Data/hora indisponível para este membro da equipa');
      }

      // Calcular preço final
      const finalPrice = this.calculatePrice(bookingData);

      // Criar objeto do agendamento
      const booking = {
        id: Math.random().toString(36).substr(2, 9),
        ...bookingData,
        finalPrice,
        status: 'pending',
        createdAt: new Date().toISOString(),
        photos: bookingData.photos || [],
        cep: bookingData.cep || null,
        location: bookingData.location || null,
        cancellationPolicy: JSON.stringify(this.[REDACTED_TOKEN]()),
        achievements: JSON.stringify(this.[REDACTED_TOKEN](bookingData.userId))
      };

      // Persistir em SQLite
      const db = await getDb();
      await db.run(
        `INSERT INTO bookings (id, userId, date, services, address, cep, notes, photos, location, finalPrice, status, createdAt, cancellationPolicy, achievements)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        booking.id,
        booking.userId,
        booking.date,
        JSON.stringify(booking.services || []),
        booking.address,
        booking.cep,
        booking.notes || '',
        JSON.stringify(booking.photos || []),
        JSON.stringify(booking.location || {}),
        booking.finalPrice,
        booking.status,
        booking.createdAt,
        booking.cancellationPolicy,
        booking.achievements
      );

      return booking;
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId) {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC', userId);
    return rows.map(r => ({
      ...r,
      services: JSON.parse(r.services || '[]'),
      photos: JSON.parse(r.photos || '[]'),
      location: JSON.parse(r.location || '{}'),
      cancellationPolicy: JSON.parse(r.cancellationPolicy || '{}'),
      achievements: JSON.parse(r.achievements || '[]')
    }));
  }

  /**
   * Política padrão de cancelamento (percentual ou taxa fixa)
   */
  [REDACTED_TOKEN]() {
    return {
      [REDACTED_TOKEN]: 20, // percentual cobrado do cliente em cancelamento em menos de 24h
      [REDACTED_TOKEN]: 0, // percentual cobrado ao prestador (aplicado em casos de no-show)
      freeCancelHours: 48 // cancelamento gratuito até X horas antes
    };
  }

  /**
   * Calcular penalidade de cancelamento
   * cancelBy: 'client' | 'provider'
   */
  [REDACTED_TOKEN](booking, cancelBy = 'client', hoursBefore = 0) {
    const policy = booking.cancellationPolicy || this.[REDACTED_TOKEN]();
    if (hoursBefore >= policy.freeCancelHours) return 0;
    if (cancelBy === 'client') {
      return Math.round((booking.finalPrice || 0) * (policy.[REDACTED_TOKEN] / 100) * 100) / 100;
    }
    if (cancelBy === 'provider') {
      return Math.round((booking.finalPrice || 0) * (policy.[REDACTED_TOKEN] / 100) * 100) / 100;
    }
    return 0;
  }

  /**
   * Verificar e retornar conquistas (mock)
   */
  [REDACTED_TOKEN](userId) {
    // Implementação simples: no primeiro agendamento retorna conquista "Primeiro Agendamento".
    // Em produção, isso deve consultar contagem real no banco de dados.
    if (!userId) return [];
    return [{ key: 'first_booking', title: 'Primeiro Agendamento', earnedAt: new Date() }];
  }

  /**
   * Validar dados do agendamento
   */
  validateBookingData(data) {
    if (!data.userId) throw new Error('userId é obrigatório');
    if (!data.date) throw new Error('date é obrigatório');
    if (!data.services || data.services.length === 0) throw new Error('Pelo menos um serviço é obrigatório');
    if (!data.address) throw new Error('address é obrigatório');

    // Verificar se data é futura
    if (new Date(data.date) < new Date()) {
      throw new Error('A data deve ser no futuro');
    }
  }

  /**
   * Verificar conflitos de agendamento
   */
  async checkForConflicts(date, teamMemberId) {
    // Implementar verificação de conflitos no banco de dados
    // const conflicts = await db.bookings.find({
    //   date: { $gte: date, $lt: addHours(date, 3) },
    //   teamMemberId: teamMemberId,
    //   status: { $ne: 'cancelled' }
    // });
    // return conflicts.length > 0;
    return false;
  }

  /**
   * Calcular preço do agendamento
   */
  calculatePrice(data) {
    let total = 0;

    // Somar preços dos serviços
    data.services.forEach(service => {
      total += service.price;
    });

    // Adicionar taxa por metragem (se fornecida)
    if (data.metragem) {
      total += data.metragem * 0.5; // R$ 0.50 por m²
    }

    // Aplicar multiplicador de urgência
    if (data.urgencia === 'express') {
      total *= 1.3;
    } else if (data.urgencia === 'emergencia') {
      total *= 1.5;
    }

    // Aplicar multiplicador de frequência
    if (data.frequencia === 'semanal') {
      total *= 0.8;
    } else if (data.frequencia === 'quinzenal') {
      total *= 0.9;
    } else if (data.frequencia === 'mensal') {
      total *= 0.95;
    }

    return total;
  }

  /**
   * Atualizar status do agendamento
   */
  async updateStatus(bookingId, status) {
    try {
      // await db.bookings.updateOne(
      //   { _id: bookingId },
      //   { status, updatedAt: new Date() }
      // );
      return { success: true, bookingId, status };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Atribuir agendamento automaticamente
   */
  async autoAssignBooking(bookingId) {
    try {
      // const booking = await db.bookings.findById(bookingId);
      
      // Encontrar membro da equipa disponível
      // const availableTeamMember = await this.[REDACTED_TOKEN](
      //   booking.date,
      //   booking.location
      // );

      // if (!availableTeamMember) {
      //   throw new Error('Nenhum membro disponível');
      // }

      // Atribuir agendamento
      // await db.bookings.updateOne(
      //   { _id: bookingId },
      //   { teamMemberId: availableTeamMember.id, assigned: true }
      // );

      return { success: true, message: 'Agendamento atribuído' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Encontrar membro da equipa disponível
   */
  async [REDACTED_TOKEN](date, location) {
    try {
      // Implementar lógica de busca otimizada
      // 1. Buscar membros próximos da localização
      // 2. Verificar disponibilidade na data/hora
      // 3. Considerar carga de trabalho
      // 4. Retornar o mais eficiente
      return null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BookingService();
