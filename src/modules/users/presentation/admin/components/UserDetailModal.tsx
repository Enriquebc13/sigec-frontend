import { AppModal } from '@/components/appModal';
import { UserChanges } from '@/modules/users/domain/entities/user-changes.entity';
import { User } from '@/modules/users/domain/entities/user.entity';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

const roleLabel = { ADMIN: 'Administrador', CLIENT: 'Cliente' };

type Props = {
  user: User | null;
  onClose: () => void;
  onDelete: (user: User) => Promise<void>;
  // Devuelve true si se guardó, para saber si salir del modo edición
  onUpdate: (user: User, changes: UserChanges) => Promise<boolean>;
};

export function UserDetailModal({ user, onClose, onDelete, onUpdate }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');

  // Cada vez que cambia el usuario (se abre otro, o se guardaron cambios),
  // se sale del modo edición y se cargan sus datos en el formulario
  useEffect(() => {
    setEditing(false);
    setName(user?.name ?? '');
    setLastname(user?.lastname ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const cancelEdit = () => {
    setName(user?.name ?? '');
    setLastname(user?.lastname ?? '');
    setEmail(user?.email ?? '');
    setEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    // Solo se mandan los campos que realmente cambiaron
    const changes: UserChanges = {};
    if (name.trim() !== user.name) changes.name = name;
    if (lastname.trim() !== user.lastname) changes.lastname = lastname;
    if (email.trim().toLowerCase() !== user.email) changes.email = email;

    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    const ok = await onUpdate(user, changes);
    setSaving(false);
    if (ok) setEditing(false);
  };

  // Pide confirmación antes de borrar, porque la acción no se puede deshacer
  const confirmDelete = () => {
    if (!user) return;

    Alert.alert(
      'Eliminar usuario',
      `¿Seguro que quieres eliminar a ${user.fullName}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await onDelete(user);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <AppModal visible={!!user} onClose={onClose} title="Detalle del usuario">
      {user && (
        <>
          {editing ? (
            <>
              <Text style={styles.label}>Nombre</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />

              <Text style={styles.label}>Apellido</Text>
              <TextInput style={styles.input} value={lastname} onChangeText={setLastname} />

              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{user.fullName}</Text>

              <Text style={styles.label}>Correo</Text>
              <Text style={styles.value}>{user.email}</Text>
            </>
          )}

          {/* El rol y el estado no se editan desde aquí */}
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{roleLabel[user.role]}</Text>

          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>{user.active ? 'Activo' : 'Inactivo'}</Text>

          {editing ? (
            <>
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
                onPress={cancelEdit}
                disabled={saving}
              >
                <Text style={styles.secondaryText}>Cancelar</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.primaryButton} onPress={() => setEditing(true)}>
                <Text style={styles.buttonText}>Editar usuario</Text>
              </Pressable>

              <Pressable
                style={[styles.deleteButton, deleting && { opacity: 0.6 }]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Eliminar usuario</Text>
                )}
              </Pressable>
            </>
          )}
        </>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, color: '#888', marginTop: 10 },
  value: { fontSize: 16, color: '#222' },
  input: {
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#CCC',
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
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#D32F2F',
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
    borderColor: '#CCC',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryText: { color: '#555', fontWeight: '600', fontSize: 16 },
});