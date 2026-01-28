import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user.dart';
import 'storage_service.dart';

class AuthService {
  final firebase_auth.FirebaseAuth _auth = firebase_auth.FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final StorageService _storage = StorageService();

  Future<User?> signIn(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        // Récupérer les données utilisateur depuis Firestore
        final doc = await _firestore
            .collection('users')
            .doc(credential.user!.uid)
            .get();

        if (doc.exists) {
          final user = User(
            uid: credential.user!.uid,
            email: email,
            name: doc.data()?['name'] ?? '',
            role: doc.data()?['role'] ?? '',
            phone: doc.data()?['phone'],
            employeeId: doc.data()?['employeeId'],
          );

          // Sauvegarder localement
          await _storage.saveUser(user);
          return user;
        }
      }
      return null;
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
    await _storage.clearUser();
  }

  Future<User?> getCurrentUser() async {
    return await _storage.getUser();
  }

  firebase_auth.User? get currentFirebaseUser => _auth.currentUser;
}
