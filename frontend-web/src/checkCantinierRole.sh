#!/bin/bash

echo "🔍 AUDIT DU RÔLE CANTINIER"
echo "=========================="
echo ""

echo "📋 1. Vérification du Dashboard Cantinier"
if [ -f "components/dashboard/CantinierDashboard.tsx" ]; then
  echo "✅ CantinierDashboard existe"
else
  echo "❌ CantinierDashboard MANQUANT"
fi

echo ""
echo "📋 2. Vérification de App.tsx (Routes)"
if grep -q "CantinierDashboard" App.tsx; then
  echo "✅ Route CantinierDashboard configurée"
else
  echo "❌ Route CantinierDashboard MANQUANTE"
fi

echo ""
echo "📋 3. Vérification de Sidebar.tsx (Menu)"
if grep -q "cantinier" components/layout/Sidebar.tsx; then
  echo "✅ Menu cantinier configuré"
else
  echo "❌ Menu cantinier MANQUANT"
fi

echo ""
echo "📋 4. Vérification des permissions"
grep -n "cantinier" App.tsx | head -10
