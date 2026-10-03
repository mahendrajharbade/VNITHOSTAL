import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Database, Server, RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface DbStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbStatusModal: React.FC<DbStatusModalProps> = ({ isOpen, onClose }) => {
  const { systemStatus, refreshSystemStatus, notify } = useAuth();
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const updated = await api.reconnectDb();
      await refreshSystemStatus();
      if (updated.connectedToMySQL) {
        notify('success', 'Successfully connected to MySQL database!');
      } else {
        notify('info', 'Tested MySQL connection. Running with built-in relational SQL engine.');
      }
    } catch (err: any) {
      notify('error', err.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const isMySQL = systemStatus?.connectedToMySQL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isMySQL ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Database & Architecture Status</h3>
              <p className="text-xs text-slate-500">VNIT Hostel Management Relational Backend</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isMySQL
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-blue-50/60 border-blue-200 text-blue-900'
            }`}
          >
            {isMySQL ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Server className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {isMySQL ? 'Connected to External MySQL Database' : 'Active Engine: Relational Memory Storage'}
              </div>
              <p className="text-xs mt-1 text-slate-600 leading-relaxed">
                {systemStatus?.message}
              </p>
            </div>
          </div>

          {/* Architecture Map */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Application Architecture Pipeline
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 py-1 font-mono">
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">React Frontend</span>
              <span>⟶</span>
              <span className="font-semibold text-slate-800 bg-slate-200 px-2 py-1 rounded">Node Express API</span>
              <span>⟶</span>
              <span className={`font-semibold px-2 py-1 rounded ${isMySQL ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                {isMySQL ? 'MySQL 8.0 Server' : 'Relational Engine (Sample Data)'}
              </span>
            </div>
          </div>

          {/* Configuration Parameters */}
          <div className="text-xs space-y-2">
            <div className="font-semibold text-slate-700">Database Connection Variables (.env):</div>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1">
              <div>MYSQL_HOST = "{systemStatus?.config.host || 'localhost'}"</div>
              <div>MYSQL_PORT = {systemStatus?.config.port || 3306}</div>
              <div>MYSQL_USER = "{systemStatus?.config.user || 'root'}"</div>
              <div>MYSQL_DATABASE = "{systemStatus?.config.database || 'vnit_hostel_db'}"</div>
              <div>MYSQL_PASSWORD = "****************"</div>
            </div>
          </div>

          {/* Instructions to connect */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
            <span className="font-semibold text-slate-700">Connecting to your MySQL Database:</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>Execute <code className="text-indigo-600 font-mono">database/schema.sql</code> and <code className="text-indigo-600 font-mono">database/seed.sql</code> in your MySQL client (Workbench / phpMyAdmin / CLI).</li>
              <li>Provide your MySQL credentials in the <code className="text-indigo-600 font-mono">.env</code> file.</li>
              <li>Click <strong>Retry Connection</strong> below to connect dynamically without restarting.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing Connection...' : 'Retry MySQL Connection'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
