import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { dataClient } from '@/api/dataClient';
import { UserPlus, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import AdminGuard from '@/components/admin/AdminGuard';

export default function Settings() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [invitePassword, setInvitePassword] = useState('');

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editUnitId, setEditUnitId] = useState('none');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['settings-users'],
    queryFn: () => dataClient.entities.User.list(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units-for-settings'],
    queryFn: () => dataClient.entities.Unit.list(),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => dataClient.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-users'] });
      toast({ title: 'Usuario atualizado!' });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, password }) => dataClient.users.setUserPassword(userId, password),
    onSuccess: () => {
      toast({ title: 'Senha atualizada com sucesso!' });
      setPasswordOpen(false);
      setSelectedUser(null);
      setNewPassword('');
    },
  });

  const handleInvite = async () => {
    if (!inviteName.trim()) {
      toast({ title: 'Nome obrigatorio', description: 'Informe o nome do usuario.' });
      return;
    }

    if (invitePassword && invitePassword.length < 8) {
      toast({ title: 'Senha inicial invalida', description: 'Use pelo menos 8 caracteres.' });
      return;
    }

    await dataClient.users.inviteUser(inviteEmail, inviteRole, invitePassword, inviteName.trim());
    toast({ title: 'Convite enviado!', description: `Convite enviado para ${inviteEmail}` });
    setInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
    setInvitePassword('');
    setInviteRole('user');
  };

  const openPasswordDialog = (targetUser) => {
    setSelectedUser(targetUser);
    setNewPassword('');
    setPasswordOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser?.id) return;
    if (newPassword.length < 8) {
      toast({ title: 'Senha invalida', description: 'Use pelo menos 8 caracteres.' });
      return;
    }

    await updatePasswordMutation.mutateAsync({ userId: selectedUser.id, password: newPassword });
  };

  const openEditDialog = (targetUser) => {
    setEditUser(targetUser);
    setEditName(targetUser?.full_name || '');
    setEditRole(targetUser?.role || 'user');
    setEditUnitId(targetUser?.unit_id || 'none');
    setEditOpen(true);
  };

  const handleSaveUserInfo = async () => {
    if (!editUser?.id) return;
    if (!editName.trim()) {
      toast({ title: 'Nome obrigatorio', description: 'Informe o nome do usuario.' });
      return;
    }

    const unit = units.find(un => un.id === editUnitId);
    await updateUserMutation.mutateAsync({
      id: editUser.id,
      data: {
        full_name: editName.trim(),
        role: editRole,
        unit_id: editUnitId === 'none' ? null : editUnitId,
        unit_name: unit?.name || null,
      }
    });
    setEditOpen(false);
    setEditUser(null);
  };

  return (
    <AdminGuard user={user}>
      <div className="min-h-screen" style={{ background: '#f2f2f2' }}>
        <div style={{ background: '#141414' }} className="px-6 lg:px-10 py-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#E30613' }}>Administracao</p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Configuracoes</h1>
          <p className="text-xs mt-1" style={{ color: '#666' }}>Gerencie usuarios, funcoes e unidades</p>
        </div>

        <div className="px-6 lg:px-10 py-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all"
              style={{ background: '#E30613' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b80010'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E30613'; }}
            >
              <UserPlus className="w-4 h-4" /> Convidar Usuario
            </button>
          </div>

          <div className="bg-white overflow-hidden" style={{ borderTop: '3px solid #E30613' }}>
            <Table>
              <TableHeader>
                <TableRow style={{ background: '#fafafa' }}>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Nome</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Email</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Funcao</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Unidade</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-sm" style={{ color: '#999' }}>Carregando...</TableCell></TableRow>
                ) : users.map(u => (
                  <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-bold text-sm" style={{ color: '#141414' }}>{u.full_name || '-'}</TableCell>
                    <TableCell className="text-xs" style={{ color: '#666' }}>{u.email}</TableCell>
                    <TableCell className="text-xs">{u.role || 'user'}</TableCell>
                    <TableCell className="text-xs">{u.unit_name || 'Nenhuma'}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditDialog(u)}
                          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"
                          style={{ background: '#333' }}
                        >
                          <span className="inline-flex items-center gap-1"><Pencil className="w-3 h-3" /> Editar</span>
                        </button>
                        <button
                          onClick={() => openPasswordDialog(u)}
                          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"
                          style={{ background: '#141414' }}
                        >
                          Alterar Senha
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-wider text-sm">Convidar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Nome *</Label>
              <Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Nome completo" style={{ borderRadius: 2 }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Email *</Label>
              <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@macom.com.br" style={{ borderRadius: 2 }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Funcao</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger style={{ borderRadius: 2 }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Senha Inicial (Opcional)</Label>
              <Input
                type="password"
                value={invitePassword}
                onChange={e => setInvitePassword(e.target.value)}
                placeholder="Minimo 8 caracteres"
                style={{ borderRadius: 2 }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setInviteOpen(false)} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest border border-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || !inviteName.trim()}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
                style={{ background: '#E30613' }}
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-wider text-sm">Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Nome *</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome completo" style={{ borderRadius: 2 }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Funcao</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger style={{ borderRadius: 2 }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Unidade</Label>
              <Select value={editUnitId} onValueChange={setEditUnitId}>
                <SelectTrigger style={{ borderRadius: 2 }}><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {units.map(un => (
                    <SelectItem key={un.id} value={un.id}>{un.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditOpen(false)} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest border border-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button
                onClick={handleSaveUserInfo}
                disabled={updateUserMutation.isPending}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
                style={{ background: '#141414' }}
              >
                {updateUserMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-wider text-sm">Alterar Senha do Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs" style={{ color: '#666' }}>{selectedUser?.email || ''}</p>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Nova senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimo 8 caracteres"
                style={{ borderRadius: 2 }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPasswordOpen(false)} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest border border-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button
                onClick={handleUpdatePassword}
                disabled={!newPassword || updatePasswordMutation.isPending}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
                style={{ background: '#141414' }}
              >
                {updatePasswordMutation.isPending ? 'Salvando...' : 'Salvar senha'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}
