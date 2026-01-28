import 'package:flutter/material.dart';
import '../models/bottle.dart';
import '../models/client.dart';
import '../models/movement.dart';
import '../services/api_service.dart';

class DataProvider with ChangeNotifier {
  List<Bottle> _bottles = [];
  List<Client> _clients = [];
  List<Movement> _movements = [];
  bool _isLoading = false;

  List<Bottle> get bottles => _bottles;
  List<Client> get clients => _clients;
  List<Movement> get movements => _movements;
  bool get isLoading => _isLoading;

  Future<void> loadAllData() async {
    _isLoading = true;
    notifyListeners();

    await Future.wait([
      loadBottles(),
      loadClients(),
      loadMovements(),
    ]);

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadBottles() async {
    _bottles = await ApiService.getBottles();
    notifyListeners();
  }

  Future<void> loadClients() async {
    _clients = await ApiService.getClients();
    notifyListeners();
  }

  Future<void> loadMovements() async {
    _movements = await ApiService.getMovements();
    notifyListeners();
  }

  Future<bool> createMovement(Map<String, dynamic> movementData) async {
    final success = await ApiService.createMovement(movementData);
    if (success) {
      await loadAllData();
    }
    return success;
  }

  // Statistiques
  int get totalBottles => _bottles.length;
  int get bottlesInStock => _bottles.where((b) => b.currentLocation == 'entrepôt').length;
  int get bottlesInCirculation => _bottles.where((b) => b.currentLocation == 'client').length;
  int get bottlesInTransit => _bottles.where((b) => b.currentLocation == 'cantinier').length;
}
