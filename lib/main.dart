import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
// import 'firebase_options.dart'; // Uncomment once flutterfire configure is run

import 'core/theme.dart';
import 'views/main_layout.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    await Firebase.initializeApp(); // Fallback if no options
  } catch (e) {
    debugPrint("Firebase init failed (flutterfire configure likely missing): $e");
  }

  runApp(
    const ProviderScope(
      child: IsteApp(),
    ),
  );
}

class IsteApp extends StatelessWidget {
  const IsteApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ISTE MBCET ExeCom',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainLayout(),
    );
  }
}
