import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<DataProvider>().loadAllData();
        },
        child: Consumer2<DataProvider, AuthProvider>(
          builder: (context, dataProvider, authProvider, child) {
            if (dataProvider.isLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            final user = authProvider.user;

            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Carte de bienvenue
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            child: Text(
                              user?.name[0].toUpperCase() ?? 'U',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Bienvenue ${user?.name ?? ''}',
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                                Text(
                                  user?.role.toUpperCase() ?? '',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Statistiques
                  Text(
                    'Vue d\'ensemble',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),

                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.5,
                    children: [
                      _StatCard(
                        title: 'Bouteilles',
                        value: '${dataProvider.totalBottles}',
                        subtitle: 'Total',
                        icon: Icons.inventory,
                        color: Colors.blue,
                      ),
                      _StatCard(
                        title: 'En stock',
                        value: '${dataProvider.bottlesInStock}',
                        subtitle: 'Entrepôt',
                        icon: Icons.warehouse,
                        color: Colors.green,
                      ),
                      _StatCard(
                        title: 'En circulation',
                        value: '${dataProvider.bottlesInCirculation}',
                        subtitle: 'Chez clients',
                        icon: Icons.location_on,
                        color: Colors.orange,
                      ),
                      _StatCard(
                        title: 'En transit',
                        value: '${dataProvider.bottlesInTransit}',
                        subtitle: 'Cantiniers',
                        icon: Icons.local_shipping,
                        color: Colors.purple,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Statistiques supplémentaires
                  Row(
                    children: [
                      Expanded(
                        child: _InfoCard(
                          title: 'Clients',
                          value: '${dataProvider.clients.length}',
                          icon: Icons.people,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _InfoCard(
                          title: 'Mouvements',
                          value: '${dataProvider.movements.length}',
                          icon: Icons.swap_horiz,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Mouvements récents
                  Text(
                    'Mouvements récents',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),

                  ...dataProvider.movements.take(5).map((movement) {
                    final bottle = dataProvider.bottles.firstWhere(
                      (b) => b.id == movement.bottleId,
                      orElse: () => dataProvider.bottles.first,
                    );

                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.withOpacity(0.1),
                          child: const Icon(Icons.swap_horiz, color: Colors.blue),
                        ),
                        title: Text(bottle.serialNumber),
                        subtitle: Text(
                          '${movement.fromLocation} → ${movement.toLocation}',
                        ),
                        trailing: Text(
                          movement.movementDate != null
                              ? '${movement.movementDate!.day}/${movement.movementDate!.month}'
                              : '',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                    );
                  }).toList(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                Icon(icon, color: color, size: 24),
              ],
            ),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _InfoCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, size: 32, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
