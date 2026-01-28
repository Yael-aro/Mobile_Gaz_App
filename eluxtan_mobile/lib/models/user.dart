class User {
  final String uid;
  final String email;
  final String name;
  final String role;
  final String? phone;
  final String? employeeId;

  User({
    required this.uid,
    required this.email,
    required this.name,
    required this.role,
    this.phone,
    this.employeeId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      uid: json['uid'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? '',
      phone: json['phone'],
      employeeId: json['employeeId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'role': role,
      'phone': phone,
      'employeeId': employeeId,
    };
  }
  
  bool get isAdmin => role == 'admin';
  bool get isCantinier => role == 'cantinier';
  bool get isClient => role == 'client';
}
