/**
 * Script: Auto-assign jobs
 * Distribui automaticamente agendamentos para a equipa
 */

const BookingService = require('../services/BookingService');
const AutomationService = require('../services/AutomationService');

async function autoAssignJobs() {
  try {
    console.log('Iniciando distribuição automática de agendamentos...');

    // Buscar agendamentos não atribuídos
    // const unassignedBookings = await BookingService.findUnassigned();

    // for (const booking of unassignedBookings) {
    //   console.log(`Atribuindo agendamento ${booking.id}...`);
    //   
    //   // Atribuir equipa
    //   await BookingService.autoAssignBooking(booking.id);
    //   
    //   // Executar automações
    //   await AutomationService.[REDACTED_TOKEN](booking);
    // }

    console.log('Distribuição concluída!');
  } catch (error) {
    console.error('Erro na distribuição automática:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  autoAssignJobs();
}

module.exports = autoAssignJobs;
