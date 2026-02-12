#!/bin/bash

# SCRIPT DE AUTOMAÇÃO PARA CORREÇÃO DE PLACEHOLDERs
# Este script ajuda a automatizar as correções dos PLACEHOLDERs encontrados
# Executar com: bash fix-placeholders.sh [--dry-run|--apply]

set -e

MODE="${1:---dry-run}"
WORKSPACE="/workspaces/acabamos/backend"
REPORT_FILE="/tmp/placeholder_fixes_report.txt"

echo "🔧 Iniciando correção de PLACEHOLDERs"
echo "📁 Workspace: $WORKSPACE"
echo "🎯 Modo: $MODE"
echo ""
echo "======================================" | tee "$REPORT_FILE"
echo "RELATÓRIO DE CORREÇÕES" | tee -a "$REPORT_FILE"
echo "======================================" | tee -a "$REPORT_FILE"

# Contador de mudanças
TOTAL_CHANGES=0
SKIPPED=0
APPLIED=0

# ============================================================================
# GRUPO 1: db.get/run/all.__PLACEHOLDER
# ============================================================================

fix_mock_placeholder() {
    local file="$1"
    local pattern="$2"
    local replacement="$3"
    local description="$4"
    
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo não encontrado: $file" | tee -a "$REPORT_FILE"
        return 1
    fi
    
    # Buscar ocorrências da pattern
    if grep -q "$pattern" "$file" 2>/dev/null; then
        local count=$(grep -c "$pattern" "$file" 2>/dev/null || echo "0")
        echo "📝 $file: Encontradas $count ocorrências de $description" | tee -a "$REPORT_FILE"
        
        if [ "$MODE" = "--apply" ]; then
            sed -i "s/$pattern/$replacement/g" "$file"
            echo "✅ Aplicado $count correções em $file" | tee -a "$REPORT_FILE"
            ((APPLIED += count))
        else
            echo "⏭️  [DRY-RUN] Seriam aplicadas $count correções" | tee -a "$REPORT_FILE"
            ((TOTAL_CHANGES += count))
        fi
    else
        ((SKIPPED += 1))
    fi
}

# ============================================================================
# GRUPO 2: expect().__PLACEHOLDER(value)
# ============================================================================

echo ""
echo "===================" | tee -a "$REPORT_FILE"
echo "GRUPO 1: Mock Methods" | tee -a "$REPORT_FILE"
echo "===================" | tee -a "$REPORT_FILE"

# Padrão 1: db.get.__PLACEHOLDER(value)
fix_mock_placeholder \
    "$WORKSPACE/src/services/__tests__/NotificationService.test.js" \
    "mockDb\.get\.__PLACEHOLDER(" \
    "mockDb.get.mockResolvedValue(" \
    "mockDb.get.__PLACEHOLDER"

# Padrão 2: db.run.__PLACEHOLDER(func)
fix_mock_placeholder \
    "$WORKSPACE/src/__tests__/services/MonitoringService.test.js" \
    "db\.run\.__PLACEHOLDER(" \
    "db.run.mockImplementation(" \
    "db.run.__PLACEHOLDER"

# Padrão 3: db.all.__PLACEHOLDER(func)
fix_mock_placeholder \
    "$WORKSPACE/src/__tests__/services/MonitoringService.test.js" \
    "db\.all\.__PLACEHOLDER(" \
    "db.all.mockImplementation(" \
    "db.all.__PLACEHOLDER"

echo ""
echo "===================" | tee -a "$REPORT_FILE"
echo "GRUPO 2: Jest Matchers" | tee -a "$REPORT_FILE"
echo "===================" | tee -a "$REPORT_FILE"

# Padrão 4: expect(res.status).__PLACEHOLDER(400)
fix_mock_placeholder \
    "$WORKSPACE/src/__tests__/Validation.test.js" \
    "expect(res\.status)\.__PLACEHOLDER(" \
    "expect(res.status).toHaveBeenCalledWith(" \
    "expect(res.status).__PLACEHOLDER"

# Padrão 5: expect(routes.length).__PLACEHOLDER(n)
fix_mock_placeholder \
    "$WORKSPACE/src/__tests__/routes/profile.integration.test.js" \
    "expect(.*\.length)\.__PLACEHOLDER(" \
    "expect(\1.length).toBe(" \
    "expect(...).length.__PLACEHOLDER"

echo ""
echo "===================" | tee -a "$REPORT_FILE"
echo "GRUPO 3: Service Methods (Manual Review Needed)" | tee -a "$REPORT_FILE"
echo "===================" | tee -a "$REPORT_FILE"

echo "📌 Arquivo: PixService.test.js" | tee -a "$REPORT_FILE"
echo "   Linha 192: PixService.__PLACEHOLDER → ._mai()" | tee -a "$REPORT_FILE"
echo "   Linhas 200, 206, 212: PixService.__PLACEHOLDER → ._adf()" | tee -a "$REPORT_FILE"

echo "📌 Arquivo: critical-services.test.js" | tee -a "$REPORT_FILE"
echo "   Linhas 79, 84: PixPaymentService.__PLACEHOLDER → .validateWebhookSignature()" | tee -a "$REPORT_FILE"

echo "📌 Arquivo: NotificationService.test.js" | tee -a "$REPORT_FILE"
echo "   Linha 204: notificationService.__PLACEHOLDER → .sendPaymentLink()" | tee -a "$REPORT_FILE"
echo "   Linha 218: notificationService.__PLACEHOLDER → .sendPaymentConfirmation()" | tee -a "$REPORT_FILE"
echo "   Linha 229: notificationService.__PLACEHOLDER → .sendReferralLink()" | tee -a "$REPORT_FILE"

echo "📌 Arquivo: EmailService.test.js (16 ocorrências)" | tee -a "$REPORT_FILE"
echo "   emailService.__PLACEHOLDER → .sendBookingConfirmation()" | tee -a "$REPORT_FILE"

echo ""
echo "===================" | tee -a "$REPORT_FILE"
echo "RESUMO" | tee -a "$REPORT_FILE"
echo "===================" | tee -a "$REPORT_FILE"
echo "Total de mudanças: $TOTAL_CHANGES" | tee -a "$REPORT_FILE"
echo "Mudanças aplicadas: $APPLIED" | tee -a "$REPORT_FILE"
echo "Puladas (não encontradas): $SKIPPED" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

if [ "$MODE" = "--apply" ]; then
    echo "✅ Correções aplicadas com sucesso!"
    echo "📊 Veja o relatório em: $REPORT_FILE"
else
    echo "⏭️  Modo DRY-RUN ativado. Execute novamente com --apply para aplicar mudanças"
    echo "📊 Veja o relatório em: $REPORT_FILE"
fi

echo ""
echo "📋 Próximos passos manuais:"
echo "   1. Revisar e corrigir métodos de serviço (PixService, NotificationService, etc)"
echo "   2. Verificar métodos em RoutingService"
echo "   3. Corrigir variáveis de ambiente (NotificationsController.test.js:6)"
echo "   4. Nomear descritores 'describe(PLACEHOLDER, ...)' adequadamente"
echo "   5. Executar npm test para validar as correções"
