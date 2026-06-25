import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/execom_member.dart';
import '../controllers/member_controller.dart';
import '../core/theme.dart';

class ChairpersonPanel extends ConsumerStatefulWidget {
  const ChairpersonPanel({Key? key}) : super(key: key);

  @override
  ConsumerState<ChairpersonPanel> createState() => _ChairpersonPanelState();
}

class _ChairpersonPanelState extends ConsumerState<ChairpersonPanel> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _branchController = TextEditingController();
  final _designationController = TextEditingController();
  UserRole _selectedRole = UserRole.generalMember;
  final _pointsController = TextEditingController(text: '0');

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final newMember = ExecomMember(
        fullName: _nameController.text.trim(),
        email: _emailController.text.trim(),
        branchBatch: _branchController.text.trim(),
        role: _selectedRole,
        designation: _designationController.text.trim(),
        corePoints: int.tryParse(_pointsController.text) ?? 0,
      );

      ref.read(membersProvider.notifier).addMember(newMember);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('ExeCom Member Added Successfully!'),
          backgroundColor: AppTheme.successGreen,
        ),
      );

      _nameController.clear();
      _emailController.clear();
      _branchController.clear();
      _designationController.clear();
      _selectedRole = UserRole.generalMember;
      _pointsController.text = '0';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Executive Control'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Add ExeCom Member',
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 24),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person)),
                    validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'College Email ID', prefixIcon: Icon(Icons.email)),
                    validator: (val) {
                      if (val == null || val.isEmpty) return 'Required field';
                      if (!val.endsWith('@mbcet.ac.in')) return 'Must be a valid @mbcet.ac.in email';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _branchController,
                    decoration: const InputDecoration(labelText: 'Branch/Batch (e.g. S5 CS Alpha)', prefixIcon: Icon(Icons.class_)),
                    validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<UserRole>(
                    value: _selectedRole,
                    decoration: const InputDecoration(labelText: 'System Access Role', prefixIcon: Icon(Icons.security)),
                    items: UserRole.values.map((r) => DropdownMenuItem(value: r, child: Text(r.name))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedRole = val);
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _designationController,
                    decoration: const InputDecoration(labelText: 'ISTE Designation', prefixIcon: Icon(Icons.badge)),
                    validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _pointsController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Initial Core Points', prefixIcon: Icon(Icons.stars)),
                    validator: (val) {
                      if (val == null || val.isEmpty) return 'Required field';
                      if (int.tryParse(val) == null) return 'Must be an integer';
                      return null;
                    },
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: _submit,
                    child: const Text('PROVISION MEMBER IDENTITY'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
