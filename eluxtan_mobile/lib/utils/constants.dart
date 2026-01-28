class AppConstants {
  // API Configuration
  static const String baseUrl = 'http://localhost:3001/api';
  
  // Remplace par ton IP local pour tester sur téléphone
  // static const String baseUrl = 'http://192.168.1.X:3001/api';
  
  // Routes
  static const String loginRoute = '/login';
  static const String homeRoute = '/home';
  static const String dashboardRoute = '/dashboard';
  static const String bottlesRoute = '/bottles';
  static const String clientsRoute = '/clients';
  static const String movementsRoute = '/movements';
  static const String scanRoute = '/scan';
  
  // Storage Keys
  static const String userKey = 'user';
  static const String tokenKey = 'token';
  
  // App Info
  static const String appName = 'Eluxtan';
  static const String appVersion = '1.0.0';
}
