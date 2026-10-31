import { AppModal } from '@/components/appModal';
import { UserChanges } from '@/modules/users/domain/entities/user-changes.entity';
import { User } from '@/modules/users/domain/entities/user.entity';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';

type Props = {
  user: User | null;
  onClose: () => void;
  // La vista maneja los errores y cierra el modal cuando se guardó
  onSave: (user: User, changes: UserChanges) => Promise<void>;
};

export function EditUserModal({ user, onClose, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');

  // Cada vez que se abre un usuario (o sus datos cambian), se cargan en el formulario
  useEffect(() => {
    setName(user?.name ?? '');
    setLastname(user?.lastname ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Solo se mandan los campos que realmente cambiaron
    const changes: UserChanges = {};
    if (name.trim() !== user.name) changes.name = name;
    if (lastname.trim() !== user.lastname) changes.lastname = lastname;
    if (email.trim().toLowerCase() !== user.email) changes.email = email;

    // Si no cambió nada, simplemente se cierra
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await onSave(user, changes);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal visible={!!user} onClose={onClose} title="Editar usuario">
      {user && (
        <>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            value={lastname}
            onChangeText={setLastname}
            placeholder="Apellido"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            style={[styles.primaryButton, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Guardar cambios</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={styles.secondaryText}>Cancelar</Text>
          </Pressable>
        </>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, color: '#FFFFFF', marginTop: 10 },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 25,
    backgroundColor: '#5E35B1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryText: { color: '#E5E0F0', fontWeight: '600', fontSize: 16 },
});