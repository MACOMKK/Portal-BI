import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { dataClient } from '@/api/dataClient';
import { UserPlus } from 'lucide-react';
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
  const [inviteRole, setInviteRole] = useState('user');

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
      toast({ title: 'Usuário atualizado!' });
    },
  });

  const handleInvite = async () => {
    await dataClient.users.inviteUser(inviteEmail, inviteRole);
    toast({ title: 'Convite enviado!', description: `Convite enviado para ${inviteEmail}` });
    setInviteOpen(false);
    setInviteEmail('');
  };

  return (
    <AdminGuard user={user}>
      <div className="min-h-screen" style={{ background: '#f2f2f2' }}>
        <div style={{ background: '#141414' }} className="px-6 lg:px-10 py-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#E30613' }}>Administração</p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Configurações</h1>
          <p className="text-xs mt-1" style={{ color: '#666' }}>Gerencie usuários, funções e unidades</p>
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
              <UserPlus className="w-4 h-4" /> Convidar Usuário
            </button>
          </div>

          <div className="bg-white overflow-hidden" style={{ borderTop: '3px solid #E30613' }}>
            <Table>
              <TableHeader>
                <TableRow style={{ background: '#fafafa' }}>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Nome</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Email</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Função</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Unidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10 text-sm" style={{ color: '#999' }}>Carregando...</TableCell></TableRow>
                ) : users.map(u => (
                  <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-bold text-sm" style={{ color: '#141414' }}>{u.full_name || '—'}</TableCell>
                    <TableCell className="text-xs" style={{ color: '#666' }}>{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role || 'user'}
                        onValueChange={(role) => updateUserMutation.mutate({ id: u.id, data: { role } })}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs" style={{ borderRadius: 2 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="user">Usuário</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.unit_id || 'none'}
                        onValueChange={(unitId) => {
                          const unit = units.find(un => un.id === unitId);
                          updateUserMutation.mutate({
                            id: u.id,
                            data: { unit_id: unitId === 'none' ? null : unitId, unit_name: unit?.name || null }
                          });
                        }}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs" style={{ borderRadius: 2 }}>
                          <SelectValue placeholder="Nenhuma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {units.map(un => (
                            <SelectItem key={un.id} value={un.id}>{un.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            <DialogTitle className="font-black uppercase tracking-wider text-sm">Convidar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Email *</Label>
              <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@macom.com.br" style={{ borderRadius: 2 }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">Função</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger style={{ borderRadius: 2 }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setInviteOpen(false)} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest border border-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
                style={{ background: '#E30613' }}
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}
