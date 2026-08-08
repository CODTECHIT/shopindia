import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ShieldCheck, Lock, CheckCircle } from 'lucide-react';

export const RBACPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/api/admin/rbac/roles'),
      api.get<string[]>('/api/admin/rbac/permissions')
    ]).then(([r, p]) => {
      setRoles(r);
      setPermissions(p);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 skeleton-shimmer rounded-2xl" />;


  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Role-Based Access Control (RBAC)</h1>
        <p className="text-sm text-gray-500">Configure team roles, custom permission matrices, and access security guards (FR-05.5)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {roles.map(r => (
          <div key={r._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#0F2C59]" />
                <h3 className="font-bold text-gray-900">{r.displayName}</h3>
              </div>
              {r.isSystem && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> System
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-gray-400">role: {r.name}</p>

            <div className="space-y-1.5 pt-3 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Granted Permissions</p>
              {r.name === 'super_admin' ? (
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Full System Control (Bypasses all guards)
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {r.permissions?.map((p: string) => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-4">
        <h2 className="font-bold text-gray-900 text-lg">System Permission Registry</h2>
        <p className="text-sm text-gray-500">Available route guard strings enforced by RBAC middleware:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {permissions.map(p => (
            <div key={p} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs font-mono text-gray-700 font-medium">
              🔑 {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
