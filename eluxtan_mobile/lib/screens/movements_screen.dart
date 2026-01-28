import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';
import '../models/movement.dart';

class MovementsScreen extends StatefulWidget {
  const MovementsScreen({super.key});

  @override
  State<MovementsScreen> createState() => _MovementsScreenState();
}

class _MovementsScreenState extends State<MovementsScreen> {
  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final canCreateMovement = user?.isAdmin == true || user?.isCantinier == true;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mouvements'),
      ),
      body: Consumer<DataProvider>(
        builder: (context, dataProvider, child) {
          if (dataProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (dataProvider.movements.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.swap_horiz,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Aucun mouvement',
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
            onRefresh: () => dataProvider.loadMovements(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: dataProvider.movements.length,
              itemBuilder: (context, index) {
                final movement = dataProvider.movements[index];
                final bottle = dataProvider.bottles.firstWhere(
                  (b) => b.id == movement.bottleId,
                  orElse: () => dataProvider.bottles.first,
                );

                return _MovementCard(
                  movement: movement,
                  bottleName: '${bottle.serialNumber} - ${bottle.gasBrand} ${bottle.gasVolume}L',
                  clients: dataProvider.clients,
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: canCreateMovement
          ? FloatingActionButton.extended(
              onPressed: () {
                _showCreateMovementDialog(context);
              },
              icon: const Icon(Icons.add),
              label: const Text('Nouveau'),
            )
          : null,
    );
  }

  void _showCreateMovementDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => const _CreateMovementSheet(),
    );
  }
}

class _MovementCard extends StatelessWidget {
  final Movement movement;
  final String bottleName;
  final List clients;

  const _MovementCard({
    required this.movement,
    required this.bottleName,
    required this.clients,
  });

  String _getClientName(String? clientId) {
    if (clientId == null) return '';
    final client = clients.firstWhere(
      (c) => c.id == clientId,
      orElse: () => null,
    );
    return client?.name ?? 'Client inconnu';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bouteille
            Text(
              bottleName,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            // Trajet
            Row(
              children: [
                Expanded(
                  child: _LocationChip(
                    location: movement.fromLocation,
                    clientName: _getClientName(movement.fromLocationId),
                    isDestination: false,
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8),
                  child: Icon(Icons.arrow_forward, size: 20),
                ),
                Expanded(
                  child: _LocationChip(
                    location: movement.toLocation,
                    clientName: _getClientName(movement.toLocationId),
                    isDestination: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Infos
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _InfoChip(
                  icon: Icons.person,
                  label: movement.performedBy,
                  color: Colors.blue,
                ),
                if (movement.movementDate != null)
                  _InfoChip(
                    icon: Icons.calendar_today,
                    label: DateFormat('dd/MM/yyyy HH:mm')
                        .format(movement.movementDate!),
                    color: Colors.grey,
                  ),
              ],
            ),

            // Notes
            if (movement.notes != null && movement.notes!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.note, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        movement.notes!,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _LocationChip extends StatelessWidget {
  final String location;
  final String clientName;
  final bool isDestination;

  const _LocationChip({
    required this.location,
    required this.clientName,
    required this.isDestination,
  });

  @override
  Widget build(BuildContext context) {
    final displayText = location == 'client' && clientName.isNotEmpty
        ? clientName
        : location.replaceFirst(location[0], location[0].toUpperCase());

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isDestination
            ? Colors.green.withOpacity(0.1)
            : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDestination
              ? Colors.green.withOpacity(0.3)
              : Colors.grey.withOpacity(0.3),
        ),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: isDestination ? Colors.green[700] : Colors.grey[700],
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _InfoChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _CreateMovementSheet extends StatefulWidget {
  const _CreateMovementSheet();

  @override
  State<_CreateMovementSheet> createState() => _CreateMovementSheetState();
}

class _CreateMovementSheetState extends State<_CreateMovementSheet> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedBottleId;
  String? _fromLocation;
  String? _fromLocationId;
  String? _toLocation;
  String? _toLocationId;
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final dataProvider = context.read<DataProvider>();
    final authProvider = context.read<AuthProvider>();

    final success = await dataProvider.createMovement({
      'bottleId': _selectedBottleId,
      'fromLocation': _fromLocation,
      'fromLocationId': _fromLocation == 'client' ? _fromLocationId : null,
      'toLocation': _toLocation,
      'toLocationId': _toLocation == 'client' ? _toLocationId : null,
      'performedBy': authProvider.user?.name ?? '',
      'performedByUserId': authProvider.user?.uid ?? '',
      'notes': _notesController.text.trim(),
    });

    setState(() => _isSubmitting = false);

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mouvement créé avec succès'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de la création du mouvement'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: ListView(
              controller: scrollController,
              children: [
                Text(
                  'Nouveau mouvement',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 24),

                // Depuis
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Depuis *',
                    prefixIcon: Icon(Icons.place),
                  ),
                  value: _fromLocation,
                  items: const [
                    DropdownMenuItem(value: 'entrepôt', child: Text('Entrepôt')),
                    DropdownMenuItem(value: 'client', child: Text('Client')),
                    DropdownMenuItem(value: 'cantinier', child: Text('Cantinier')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _fromLocation = value;
                      _fromLocationId = null;
                      _selectedBottleId = null;
                    });
                  },
                  validator: (value) => value == null ? 'Requis' : null,
                ),
                const SizedBox(height: 16),

                // Client source (si depuis client)
                if (_fromLocation == 'client') ...[
                  Consumer<DataProvider>(
                    builder: (context, provider, child) {
                      return DropdownButtonFormField<String>(
                        decoration: const InputDecoration(
                          labelText: 'Quel client ? *',
                          prefixIcon: Icon(Icons.person),
                        ),
                        value: _fromLocationId,
                        items: provider.clients.map((client) {
                          return DropdownMenuItem(
                            value: client.id,
                            child: Text('${client.name} (${client.bottlesCount})'),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _fromLocationId = value;
                            _selectedBottleId = null;
                          });
                        },
                        validator: (value) => value == null ? 'Requis' : null,
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                ],

                // Bouteille
                Consumer<DataProvider>(
                  builder: (context, provider, child) {
                    final availableBottles = provider.bottles.where((b) {
                      if (_fromLocation == null) return false;
                      if (_fromLocation == 'client' && _fromLocationId != null) {
                        return b.currentLocation == 'client' &&
                            b.locationId == _fromLocationId;
                      }
                      return b.currentLocation == _fromLocation;
                    }).toList();

                    return DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        labelText: 'Bouteille *',
                        prefixIcon: const Icon(Icons.propane_tank),
                        helperText: '${availableBottles.length} disponible(s)',
                      ),
                      value: _selectedBottleId,
                      items: availableBottles.map((bottle) {
                        return DropdownMenuItem(
                          value: bottle.id,
                          child: Text(
                            '${bottle.serialNumber} - ${bottle.gasBrand} ${bottle.gasVolume}L',
                          ),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() => _selectedBottleId = value);
                      },
                      validator: (value) => value == null ? 'Requis' : null,
                    );
                  },
                ),
                const SizedBox(height: 16),

                // Vers
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Vers *',
                    prefixIcon: Icon(Icons.place),
                  ),
                  value: _toLocation,
                  items: const [
                    DropdownMenuItem(value: 'entrepôt', child: Text('Entrepôt')),
                    DropdownMenuItem(value: 'client', child: Text('Client')),
                    DropdownMenuItem(value: 'cantinier', child: Text('Cantinier')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _toLocation = value;
                      _toLocationId = null;
                    });
                  },
                  validator: (value) => value == null ? 'Requis' : null,
                ),
                const SizedBox(height: 16),

                // Client destination (si vers client)
                if (_toLocation == 'client') ...[
                  Consumer<DataProvider>(
                    builder: (context, provider, child) {
                      return DropdownButtonFormField<String>(
                        decoration: const InputDecoration(
                          labelText: 'Quel client ? *',
                          prefixIcon: Icon(Icons.person),
                        ),
                        value: _toLocationId,
                        items: provider.clients.map((client) {
                          return DropdownMenuItem(
                            value: client.id,
                            child: Text(client.name),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() => _toLocationId = value);
                        },
                        validator: (value) => value == null ? 'Requis' : null,
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                ],

                // Notes
                TextField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Notes',
                    prefixIcon: Icon(Icons.note),
                  ),
                  maxLines: 3,
                ),
                const SizedBox(height: 24),

                // Boutons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _isSubmitting
                            ? null
                            : () => Navigator.pop(context),
                        child: const Text('Annuler'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submit,
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Créer'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
