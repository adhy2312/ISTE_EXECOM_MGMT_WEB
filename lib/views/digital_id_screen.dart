import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

import '../controllers/auth_controller.dart';
import '../core/theme.dart';

class DigitalIdScreen extends ConsumerStatefulWidget {
  const DigitalIdScreen({super.key});

  @override
  ConsumerState<DigitalIdScreen> createState() => _DigitalIdScreenState();
}

class _DigitalIdScreenState extends ConsumerState<DigitalIdScreen> {
  final ScreenshotController _screenshotController = ScreenshotController();

  Future<void> _shareIdCard() async {
    final Uint8List? image = await _screenshotController.capture();
    if (image != null && mounted) {
      final directory = await getApplicationDocumentsDirectory();
      final imagePath = await File('${directory.path}/digital_id.png').create();
      await imagePath.writeAsBytes(image);
      await Share.shareXFiles([XFile(imagePath.path)],
          text: 'My ISTE MBCET ExeCom Digital ID');
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(authProvider);

    if (currentUser == null) {
      return const Center(
          child: Text('No Active User', style: TextStyle(color: Colors.white)));
    }

    final qrData = jsonEncode({
      "uid": currentUser.id,
      "role": currentUser.role.index,
      "chapter": "ISTE_MBCET"
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Digital ID Pass'),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: _shareIdCard,
            tooltip: 'Share ID Card',
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Screenshot(
                controller: _screenshotController,
                child: Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxWidth: 400),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceDark,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.3),
                        width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        decoration: const BoxDecoration(
                          color: AppTheme.backgroundDark,
                          borderRadius:
                              BorderRadius.vertical(top: Radius.circular(22)),
                        ),
                        child: Center(
                          child: Text(
                            'ISTE SC MBCET',
                            style: Theme.of(context)
                                .textTheme
                                .headlineLarge
                                ?.copyWith(
                                  color: AppTheme.primaryBlue,
                                  letterSpacing: 2,
                                ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: QrImageView(
                                data: qrData,
                                version: QrVersions.auto,
                                size: 200.0,
                                backgroundColor: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 32),
                            Text(
                              currentUser.fullName,
                              style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 6),
                              decoration: BoxDecoration(
                                color:
                                    AppTheme.primaryBlue.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: AppTheme.primaryBlue
                                        .withValues(alpha: 0.5)),
                              ),
                              child: Text(
                                currentUser.designation.toUpperCase(),
                                style: const TextStyle(
                                    color: AppTheme.primaryBlue,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              currentUser.branchBatch,
                              style: const TextStyle(
                                  color: AppTheme.textSecondary, fontSize: 16),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.verified,
                                    color: AppTheme.successGreen, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'VALID: ${DateTime.now().year}-${DateTime.now().year + 1}',
                                  style: const TextStyle(
                                      color: AppTheme.successGreen,
                                      fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 40),
              ElevatedButton.icon(
                onPressed: _shareIdCard,
                icon: const Icon(Icons.download),
                label: const Text('Save / Share as Image'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
