import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../models/bottle.dart';

class BottlesScreen extends StatefulWidget {
  const BottlesScreen({super.key});

  @override
  State<BottlesScreen> createState() => _BottlesScreenState();
}

class _BottlesScreenState extends State<BottlesScreen> {
  String _filterLocation = 'all';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bouteilles'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {
              // TODO: Scanner QR
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Scanner QR - À implémenter')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtres
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _filterLocation,
                    decoration: const InputDecoration(
                      labelText: 'Filtrer par localisation',
                      prefixIcon: Icon(Icons.filter_list),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('Toutes')),
                      DropdownMenuItem(value: 'entrepôt', child: Text('Entrepôt')),
                      DropdownMenuItem(value: 'client', child: Text('Client')),
                      DropdownMenuItem(value: 'cantinier', child: Text('Cantinier')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _filterLocation = value ?? 'all';
                      });
                    },
                  ),
                ),
              ],
            ),
          ),

          // Liste des bouteilles
          Expanded(
            child: Consumer<DataProvider>(
              builder: (context, dataProvider, child) {
                if (dataProvider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final filteredBottles = dataProvider.bottles.where((bottle) {
                  if (_filterLocation == 'all') return true;
                  return bottle.currentLocation == _filterLocation;
                }).toList();

                if (filteredBottles.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Aucune bouteille',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => dataProvider.loadBottles(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredBottles.length,
                    itemBuilder: (context, index) {
                      final bottle = filteredBottles[index];
                      return _BottleCard(bottle: bottle);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _BottleCard extends StatelessWidget {
  final Bottle bottle;

  const _BottleCard({required this.bottle});

  Color _getLocationColor() {
    switch (bottle.currentLocation) {
      case 'entrepôt':
        return Colors.blue;
      case 'client':
        return Colors.green;
      case 'cantinier':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getLocationIcon() {
    switch (bottle.currentLocation) {
      case 'entrepôt':
        return Icons.warehouse;
      case 'client':
        return Icons.person;
      case 'cantinier':
        return Icons.local_shipping;
      default:
        return Icons.location_on;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          showDialog(
            context: context,
            builder: (context) => _BottleDetailsDialog(bottle: bottle),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getLocationColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.propane_tank,
                      color: _getLocationColor(),
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          bottle.serialNumber,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${bottle.gasBrand} - ${bottle.gasVolume}L',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getLocationColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getLocationIcon(),
                          size: 16,
                          color: _getLocationColor(),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          bottle.currentLocation,
                          style: TextStyle(
                            color: _getLocationColor(),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _InfoChip(
                    icon: Icons.scale,
                    label: '${bottle.weight} kg',
                  ),
                  _InfoChip(
                    icon: Icons.category,
                    label: bottle.bottleType,
                  ),
                  _InfoChip(
                    icon: Icons.check_circle,
                    label: bottle.status,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey[700]),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}

class _BottleDetailsDialog extends StatelessWidget {
  final Bottle bottle;

  const _BottleDetailsDialog({required this.bottle});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(bottle.serialNumber),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _DetailRow(label: 'Marque', value: bottle.gasBrand),
          _DetailRow(label: 'Volume', value: '${bottle.gasVolume}L'),
          _DetailRow(label: 'Type', value: bottle.bottleType),
          _DetailRow(label: 'Poids', value: '${bottle.weight} kg'),
          _DetailRow(label: 'Localisation', value: bottle.currentLocation),
          _DetailRow(label: 'Statut', value: bottle.status),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Fermer'),
        ),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '$label:',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          Text(value),
        ],
      ),
    );
  }
}
EOFcat > lib/screens/bottles_screen.dart << 'EOF'
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../models/bottle.dart';

class BottlesScreen extends StatefulWidget {
  const BottlesScreen({super.key});

  @override
  State<BottlesScreen> createState() => _BottlesScreenState();
}

class _BottlesScreenState extends State<BottlesScreen> {
  String _filterLocation = 'all';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bouteilles'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {
              // TODO: Scanner QR
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Scanner QR - À implémenter')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtres
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _filterLocation,
                    decoration: const InputDecoration(
                      labelText: 'Filtrer par localisation',
                      prefixIcon: Icon(Icons.filter_list),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('Toutes')),
                      DropdownMenuItem(value: 'entrepôt', child: Text('Entrepôt')),
                      DropdownMenuItem(value: 'client', child: Text('Client')),
                      DropdownMenuItem(value: 'cantinier', child: Text('Cantinier')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _filterLocation = value ?? 'all';
                      });
                    },
                  ),
                ),
              ],
            ),
          ),

          // Liste des bouteilles
          Expanded(
            child: Consumer<DataProvider>(
              builder: (context, dataProvider, child) {
                if (dataProvider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final filteredBottles = dataProvider.bottles.where((bottle) {
                  if (_filterLocation == 'all') return true;
                  return bottle.currentLocation == _filterLocation;
                }).toList();

                if (filteredBottles.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Aucune bouteille',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => dataProvider.loadBottles(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredBottles.length,
                    itemBuilder: (context, index) {
                      final bottle = filteredBottles[index];
                      return _BottleCard(bottle: bottle);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _BottleCard extends StatelessWidget {
  final Bottle bottle;

  const _BottleCard({required this.bottle});

  Color _getLocationColor() {
    switch (bottle.currentLocation) {
      case 'entrepôt':
        return Colors.blue;
      case 'client':
        return Colors.green;
      case 'cantinier':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getLocationIcon() {
    switch (bottle.currentLocation) {
      case 'entrepôt':
        return Icons.warehouse;
      case 'client':
        return Icons.person;
      case 'cantinier':
        return Icons.local_shipping;
      default:
        return Icons.location_on;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          showDialog(
            context: context,
            builder: (context) => _BottleDetailsDialog(bottle: bottle),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getLocationColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.propane_tank,
                      color: _getLocationColor(),
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          bottle.serialNumber,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${bottle.gasBrand} - ${bottle.gasVolume}L',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getLocationColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getLocationIcon(),
                          size: 16,
                          color: _getLocationColor(),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          bottle.currentLocation,
                          style: TextStyle(
                            color: _getLocationColor(),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _InfoChip(
                    icon: Icons.scale,
                    label: '${bottle.weight} kg',
                  ),
                  _InfoChip(
                    icon: Icons.category,
                    label: bottle.bottleType,
                  ),
                  _InfoChip(
                    icon: Icons.check_circle,
                    label: bottle.status,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey[700]),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}

class _BottleDetailsDialog extends StatelessWidget {
  final Bottle bottle;

  const _BottleDetailsDialog({required this.bottle});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(bottle.serialNumber),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _DetailRow(label: 'Marque', value: bottle.gasBrand),
          _DetailRow(label: 'Volume', value: '${bottle.gasVolume}L'),
          _DetailRow(label: 'Type', value: bottle.bottleType),
          _DetailRow(label: 'Poids', value: '${bottle.weight} kg'),
          _DetailRow(label: 'Localisation', value: bottle.currentLocation),
          _DetailRow(label: 'Statut', value: bottle.status),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Fermer'),
        ),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '$label:',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          Text(value),
        ],
      ),
    );
  }
}
