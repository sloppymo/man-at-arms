(function() {
    'use strict';
    
    // ===== HISTORICAL CURRENCY SYSTEM (100 Years War - 1340s-1350s) =====
    // English currency: 12 pence (d) = 1 shilling (s), 20 shillings = 1 pound (£)
    // French currency: 12 deniers = 1 sou, 20 sous = 1 livre tournois
    // English soldiers were paid in English currency, but encountered French currency in France
    // Exchange rate varied, but roughly: 1 livre tournois ≈ 1 pound sterling
    // For simplicity, we track wealth in English pence (what you're paid in)
    // When plundering in France, French coins are converted to equivalent English value
    // Wealth is stored in pence (smallest unit) for precision
    
    // Format currency for display (converts pence to readable format)
    function formatCurrency(pence) {
        if (pence === 0) return "0d";
        
        const pounds = Math.floor(pence / 240);
        const remainingAfterPounds = pence % 240;
        const shillings = Math.floor(remainingAfterPounds / 12);
        const remainingPence = remainingAfterPounds % 12;
        
        let result = "";
        if (pounds > 0) {
            result += "£" + pounds;
            if (shillings > 0 || remainingPence > 0) result += " ";
        }
        if (shillings > 0) {
            result += shillings + "s";
            if (remainingPence > 0) result += " ";
        }
        if (remainingPence > 0) {
            result += remainingPence + "d";
        }
        return result;
    }
    
    // Convert currency string to pence (for easy input)
    // Format: "£1 5s 3d" or "5s 3d" or "3d" or "60" (assumes pence)
    function parseCurrency(str) {
        if (typeof str === 'number') return str; // Already pence
        if (!str) return 0;
        
        let pence = 0;
        const poundsMatch = str.match(/£(\d+)/);
        const shillingsMatch = str.match(/(\d+)s/);
        const penceMatch = str.match(/(\d+)d/);
        
        if (poundsMatch) pence += parseInt(poundsMatch[1]) * 240;
        if (shillingsMatch) pence += parseInt(shillingsMatch[1]) * 12;
        if (penceMatch) pence += parseInt(penceMatch[1]);
        
        // If no currency symbols, assume it's pence
        if (!poundsMatch && !shillingsMatch && !penceMatch) {
            pence = parseInt(str) || 0;
        }
        
        return pence;
    }
    
    // Get current wealth in formatted currency
    function getFormattedWealth() {
        const pence = gameState.stats.wealth || 0;
        return formatCurrency(pence);
    }
    
    // Make available globally
    window.formatCurrency = formatCurrency;
    window.parseCurrency = parseCurrency;
    window.getFormattedWealth = getFormattedWealth;
})();
