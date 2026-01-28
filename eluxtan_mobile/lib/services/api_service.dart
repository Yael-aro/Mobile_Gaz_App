import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../models/bottle.dart';
import '../models/client.dart';
import '../models/movement.dart';

class ApiService {
  static Future<List<Bottle>> getBottles() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/bottles'),
      );

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => Bottle.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching bottles: $e');
      return [];
    }
  }

  static Future<List<Client>> getClients() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/clients'),
      );

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => Client.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching clients: $e');
      return [];
    }
  }

  static Future<List<Movement>> getMovements() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/movements'),
      );

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => Movement.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching movements: $e');
      return [];
    }
  }

  static Future<bool> createMovement(Map<String, dynamic> movementData) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/movements'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(movementData),
      );

      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error creating movement: $e');
      return false;
    }
  }
}
