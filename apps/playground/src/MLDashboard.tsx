/**
 * MLDashboard.tsx
 * ================
 * Panel de análisis de clustering de mensajes.
 * Conecta con la FastAPI en :8000 a través del proxy de Vite.
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClusterResumen {
    cluster: number;
    nombre: string;
    total: number;
    palabras_top: string[];
}

interface MLStatus {
    status: 'idle' | 'running' | 'completed' | 'error';
    started_at: string | null;
    completed_at: string | null;
    step: 'extraction' | 'clustering' | null;
    error: string | null;
    has_results: boolean;
    last_modified: string | null;
    charts: string[];
    resumen: ClusterResumen[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const CHART_LABELS: Record<string, string> = {
    '04_scatter_clusters_2d.html': 'Mapa 2D de Clusters',
    '02_distribucion_clusters.html': 'Distribución por Tema',
    '03_wordclouds_clusters.png': 'Nubes de Palabras',
};

const CLUSTER_COLORS = [
    'bg-blue-500', 'bg-red-500', 'bg-green-500',
    'bg-orange-500', 'bg-purple-500', 'bg-yellow-500',
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatusBadge({ status, step }: { status: MLStatus['status']; step: MLStatus['step'] }) {
    const map = {
        idle:      { label: 'Sin ejecutar',  cls: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
        running:   { label: step === 'extraction' ? 'Extrayendo datos...' : 'Calculando clusters...', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
        completed: { label: 'Completado',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        error:     { label: 'Error',         cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    };
    const { label, cls } = map[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
            {status === 'running' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
            {label}
        </span>
    );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

function ChartFrame({ filename }: { filename: string }) {
    const isPng = filename.endsWith('.png');
    const src = `/api/ml/charts/${filename}`;
    const label = CHART_LABELS[filename] ?? filename;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{label}</h3>
            </div>
            {isPng ? (
                <img src={src} alt={label} className="w-full object-contain max-h-96" />
            ) : (
                <iframe
                    src={src}
                    title={label}
                    className="w-full h-80 border-0"
                    sandbox="allow-scripts allow-same-origin"
                />
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MLDashboard() {
    const [mlStatus, setMlStatus] = useState<MLStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/ml/status');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: MLStatus = await res.json();
            setMlStatus(data);
            setApiError(null);
        } catch (e) {
            setApiError('No se puede conectar con la API. ¿Está corriendo el servidor Python?');
        }
    }, []);

    // Polling mientras el pipeline corre
    useEffect(() => {
        fetchStatus();
        const id = setInterval(() => {
            if (mlStatus?.status === 'running') fetchStatus();
        }, 2000);
        return () => clearInterval(id);
    }, [fetchStatus, mlStatus?.status]);

    const handleRun = async () => {
        setLoading(true);
        try {
            await fetch('/api/ml/run', { method: 'POST' });
            await fetchStatus();
        } catch {
            setApiError('Error al iniciar el pipeline.');
        } finally {
            setLoading(false);
        }
    };

    const isRunning = mlStatus?.status === 'running';
    const totalMensajes = mlStatus?.resumen.reduce((s, c) => s + c.total, 0) ?? 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        ML Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        Clustering de temas · TF-IDF + K-Means
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {mlStatus && <StatusBadge status={mlStatus.status} step={mlStatus.step} />}
                    <button
                        onClick={handleRun}
                        disabled={isRunning || loading}
                        className="
                            flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm
                            bg-indigo-600 hover:bg-indigo-700 text-white
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all hover:scale-105 shadow-md shadow-indigo-500/20
                        "
                    >
                        {isRunning ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Ejecutando...
                            </>
                        ) : (
                            <>
                                ▶ Ejecutar Pipeline
                            </>
                        )}
                    </button>
                    <button
                        onClick={fetchStatus}
                        className="px-4 py-2.5 rounded-full text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        ↻ Actualizar
                    </button>
                </div>
            </div>

            {/* API Error */}
            {apiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                    <span className="text-xl mt-0.5">⚠</span>
                    <div>
                        <p className="font-semibold">Error de conexión</p>
                        <p>{apiError}</p>
                        <p className="mt-1 text-xs opacity-70">
                            Ejecuta: <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">python -m uvicorn 03_api:app --port 8000 --reload</code>
                        </p>
                    </div>
                </div>
            )}

            {/* Pipeline error */}
            {mlStatus?.status === 'error' && mlStatus.error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    <p className="font-semibold mb-1">Error en el pipeline:</p>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">{mlStatus.error}</pre>
                </div>
            )}

            {/* Stats */}
            {mlStatus?.has_results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Mensajes analizados" value={totalMensajes} />
                    <StatCard label="Clusters descubiertos" value={mlStatus.resumen.length} />
                    <StatCard
                        label="Ultimo run"
                        value={mlStatus.last_modified ? fmtDate(mlStatus.last_modified).split(',')[0] : '—'}
                        sub={mlStatus.last_modified ? fmtDate(mlStatus.last_modified).split(',')[1]?.trim() : undefined}
                    />
                    <StatCard
                        label="Mayor cluster"
                        value={mlStatus.resumen.reduce((a, b) => a.total > b.total ? a : b, mlStatus.resumen[0])?.nombre ?? '—'}
                        sub={`${mlStatus.resumen.reduce((a, b) => a.total > b.total ? a : b, mlStatus.resumen[0])?.total ?? 0} mensajes`}
                    />
                </div>
            )}

            {/* Cluster Cards */}
            {mlStatus?.resumen && mlStatus.resumen.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Temas descubiertos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mlStatus.resumen.map((c) => (
                            <div
                                key={c.cluster}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`w-3 h-3 rounded-full ${CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length]}`} />
                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{c.nombre}</span>
                                    <span className="ml-auto text-xs font-semibold text-slate-400">{c.total} msgs</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.palabras_top.slice(0, 7).map((w) => (
                                        <span
                                            key={w}
                                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs"
                                        >
                                            {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts */}
            {mlStatus?.charts && mlStatus.charts.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Visualizaciones
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mlStatus.charts.map((f) => (
                            <ChartFrame key={f} filename={f} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {mlStatus && !mlStatus.has_results && mlStatus.status !== 'running' && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                        Sin resultados todavía
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                        Haz clic en "Ejecutar Pipeline" para extraer los datos de la BD
                        y calcular los clusters de temas automáticamente.
                    </p>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all hover:scale-105"
                    >
                        ▶ Ejecutar Pipeline
                    </button>
                </div>
            )}
        </div>
    );
}
