import { AppModal } from '@/components/appModal';
import { User } from '@/modules/users/domain/entities/user.entity';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

const roleLabel = { ADMIN: 'Administrador', CLIENT: 'Cliente' };

type Props = {
  user: User | null;
  onClose: () => void;
  onDelete: (user: User) => Promise<void>;
};

export function UserDetailModal({ user, onClose, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

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
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{user.fullName}</Text>

          <Text style={styles.label}>Correo</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{roleLabel[user.role]}</Text>

          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>{user.active ? 'Activo' : 'Inactivo'}</Text>

          <Pressable
            style={[styles.deleteButton, deleting && { opacity: 0.6 }]}
            onPress={confirmDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteText}>Eliminar usuario</Text>
            )}
          </Pressable>
        </>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, color: '#888', marginTop: 10 },
  value: { fontSize: 18, color: '#222' },
  deleteButton: {
    marginTop: 25,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});