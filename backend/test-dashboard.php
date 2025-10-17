<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;

// Simular ambiente Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTE DO DASHBOARD ===\n\n";

try {
    // Testar contagens
    echo "📊 DADOS NO BANCO:\n";
    echo "Usuários: " . User::count() . "\n";
    echo "Produtos: " . Product::count() . "\n";
    echo "Pedidos: " . Order::count() . "\n";
    echo "Categorias: " . Category::count() . "\n\n";

    // Testar endpoint do dashboard
    echo "🔗 TESTANDO ENDPOINTS:\n";
    
    // Simular requisição para o endpoint
    $controller = new \App\Http\Controllers\Api\Admin\ReportController();
    
    echo "Testando dashboardSummary...\n";
    $summaryResponse = $controller->dashboardSummary();
    $summaryData = json_decode($summaryResponse->getContent(), true);
    echo "✅ Summary: " . json_encode($summaryData, JSON_PRETTY_PRINT) . "\n\n";
    
    echo "Testando salesChart...\n";
    $salesResponse = $controller->salesChart();
    $salesData = json_decode($salesResponse->getContent(), true);
    echo "✅ Sales Chart: " . json_encode($salesData, JSON_PRETTY_PRINT) . "\n\n";
    
    echo "Testando topProducts...\n";
    $productsResponse = $controller->topProducts();
    $productsData = json_decode($productsResponse->getContent(), true);
    echo "✅ Top Products: " . json_encode($productsData, JSON_PRETTY_PRINT) . "\n\n";
    
    echo "Testando topCustomers...\n";
    $customersResponse = $controller->topCustomers();
    $customersData = json_decode($customersResponse->getContent(), true);
    echo "✅ Top Customers: " . json_encode($customersData, JSON_PRETTY_PRINT) . "\n\n";

    echo "🎉 TODOS OS TESTES PASSARAM!\n";
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
