import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchKafkaEvents,
  fetchDlqRecords,
  fetchProcessingLogs,
  fetchRetryConfig,
  updateRetryConfig,
  publishKafkaEvent,
  retryDlqEvent,
  runKafkaTests,
  fetchTestReport,
  clearProcessingLogs,
  setActiveKafkaTab,
} from '../../store/slices/kafkaSlice';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { addToast } from '../../store/slices/uiSlice';
import {
  Cpu,
  Layers,
  AlertTriangle,
  RotateCw,
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  Settings2,
  Trash2,
  Terminal,
  Activity,
} from 'lucide-react';

export const KafkaReliabilityDashboard = () => {
  const dispatch = useDispatch();
  const {
    events,
    dlqRecords,
    logs,
    retryConfig,
    testReport,
    activeTab,
    loading,
    testRunning,
  } = useSelector((state) => state.kafka);

  // Producer form state
  const [customEventId, setCustomEventId] = useState('');
  const [simulationMode, setSimulationMode] = useState('SUCCESS');
  const [payloadText, setPayloadText] = useState('{"action": "publish_post", "channel": "instagram", "post_id": 101}');

  // Dynamic config form state
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [initialIntervalMs, setInitialIntervalMs] = useState(2000);
  const [multiplier, setMultiplier] = useState(2.0);

  useEffect(() => {
    dispatch(fetchKafkaEvents());
    dispatch(fetchDlqRecords());
    dispatch(fetchProcessingLogs());
    dispatch(fetchRetryConfig());
    dispatch(fetchTestReport());
  }, [dispatch]);

  useEffect(() => {
    if (retryConfig) {
      setMaxAttempts(retryConfig.maxAttempts || 3);
      setInitialIntervalMs(retryConfig.initialIntervalMs || 2000);
      setMultiplier(retryConfig.multiplier || 2.0);
    }
  }, [retryConfig]);

  const handlePublish = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      publishKafkaEvent({
        eventId: customEventId || undefined,
        topic: 'scheduled-posts',
        payload: payloadText,
        simulationMode,
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Event Dispatched', message: `Event status: ${res.payload.status}`, type: 'success' }));
      dispatch(fetchProcessingLogs());
      dispatch(fetchDlqRecords());
    }
  };

  const handleReprocessDlq = async (eventId) => {
    const res = await dispatch(retryDlqEvent(eventId));
    if (!res.error) {
      dispatch(addToast({ title: 'Reprocessed', message: `DLQ event ${eventId} successfully reprocessed`, type: 'success' }));
      dispatch(fetchDlqRecords());
      dispatch(fetchProcessingLogs());
      dispatch(fetchKafkaEvents());
    }
  };

  const handleRunTests = async (scenario) => {
    const res = await dispatch(runKafkaTests(scenario));
    if (!res.error) {
      dispatch(addToast({ title: 'Test Suite Finished', message: 'Automated test suite report updated', type: 'success' }));
      dispatch(fetchProcessingLogs());
      dispatch(fetchKafkaEvents());
      dispatch(fetchDlqRecords());
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      updateRetryConfig({
        maxAttempts: Number(maxAttempts),
        initialIntervalMs: Number(initialIntervalMs),
        multiplier: Number(multiplier),
      })
    );
    if (!res.error) {
      dispatch(addToast({ title: 'Config Updated', message: 'Kafka exponential backoff parameters updated', type: 'success' }));
    }
  };

  const tabs = [
    { id: 'publisher', name: 'Event Producer & Simulator', icon: Play },
    { id: 'events', name: 'Event Lifecycle', icon: Layers, count: events.length },
    { id: 'dlq', name: 'Dead Letter Queue (DLQ)', icon: AlertTriangle, count: dlqRecords.filter((d) => !d.reprocessed).length },
    { id: 'logs', name: 'Processing Logs', icon: Terminal, count: logs.length },
    { id: 'tests', name: 'Automated Test Report', icon: CheckCircle2 },
    { id: 'config', name: 'Retry Configuration', icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Kafka Event-Driven Reliability Subsystem
            </h1>
            <Badge variant="success">KRaft Mode</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exponential backoff retries (2s, 4s, 8s), Dead Letter Topic routing, safe reprocessing, and database-enforced idempotency
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            loading={testRunning}
            onClick={() => handleRunTests('ALL')}
            icon={RotateCw}
          >
            Run All Reliability Tests
          </Button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Main Topic</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">scheduled-posts</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Dead Letter Topic</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">scheduled-posts-dlt</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Exponential Backoff</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">2s, 4s, 8s (3 max)</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Idempotency Guarantee</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">DB Unique Key</h4>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveKafkaTab(tab.id))}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Event Producer & Simulator */}
      {activeTab === 'publisher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7">
            <CardHeader
              title="Publish Kafka Event"
              subtitle="Test reliable asynchronous event processing with injected failure simulations"
            />
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Simulation Scenario
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'SUCCESS', name: 'No Failure (Immediate Success)', badge: 'success' },
                    { id: 'TEMPORARY', name: 'Temporary Failure (Retry & Succeed)', badge: 'warning' },
                    { id: 'PERMANENT', name: 'Permanent Failure (Route to DLQ)', badge: 'danger' },
                    { id: 'DUPLICATE', name: 'Duplicate Event (DB Idempotency)', badge: 'primary' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSimulationMode(s.id);
                        if (s.id === 'DUPLICATE') {
                          setCustomEventId('evt-idempotency-fixed-01');
                        }
                      }}
                      className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                        simulationMode === s.id
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <p className="font-semibold">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Event ID (Optional &bull; Database Idempotency Key)
                </label>
                <input
                  type="text"
                  value={customEventId}
                  onChange={(e) => setCustomEventId(e.target.value)}
                  placeholder="Leave blank to auto-generate unique UUID"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payload JSON
                </label>
                <textarea
                  rows={4}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono bg-slate-900 text-emerald-400 rounded-lg focus:outline-none"
                />
              </div>

              <Button type="submit" icon={Send} className="w-full py-2.5">
                Dispatch to Kafka Topic [scheduled-posts]
              </Button>
            </form>
          </Card>

          {/* Explanation panel */}
          <Card className="lg:col-span-5">
            <CardHeader title="How the Reliability Pipeline Works" subtitle="KRaft mode architectural guarantees" />
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 1. Database-Enforced Idempotency
                </span>
                <p>
                  Every event carries a unique <code className="text-indigo-500">eventId</code> with a unique database index. Duplicate messages arriving more than once are detected across app restarts and acknowledged safely as <span className="font-semibold">DUPLICATE_IGNORED</span> without duplicate business side effects.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> 2. Exponential Backoff Retries
                </span>
                <p>
                  Transient connection drops trigger exponential backoff delays of <span className="font-semibold">2,000ms</span>, <span className="font-semibold">4,000ms</span>, and <span className="font-semibold">8,000ms</span> (3 attempts max).
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> 3. Dead Letter Queue & Safe Reprocessing
                </span>
                <p>
                  Exhausted retries route directly to <code className="text-rose-500">scheduled-posts-dlt</code> with root cause stacktrace. Operators can inspect the payload and safely trigger reprocessing while strictly preserving the original <code className="text-indigo-500">eventId</code>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Events List */}
      {activeTab === 'events' && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Simulation Mode</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="py-2.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">{evt.eventId}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{evt.topic}</td>
                    <td className="py-2.5 px-4">
                      <Badge
                        variant={
                          evt.status === 'COMPLETED'
                            ? 'success'
                            : evt.status === 'DLQ'
                            ? 'danger'
                            : evt.status === 'DUPLICATE_IGNORED'
                            ? 'purple'
                            : 'warning'
                        }
                      >
                        {evt.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{evt.attemptCount} / 3</td>
                    <td className="py-2.5 px-4 text-slate-500">{evt.simulationMode || 'NONE'}</td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">{new Date(evt.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Dead Letter Queue */}
      {activeTab === 'dlq' && (
        <Card className="overflow-hidden p-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Unprocessed & Failed DLQ Records
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Topic: scheduled-posts-dlt</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Failure Reason</th>
                  <th className="py-3 px-4">Routed At</th>
                  <th className="py-3 px-4">Reprocess Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dlqRecords.length > 0 ? (
                  dlqRecords.map((dlq) => (
                    <tr key={dlq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-semibold text-rose-600">{dlq.eventId}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300" title={dlq.errorMessage}>
                        {dlq.errorMessage}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(dlq.routedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={dlq.reprocessed ? 'success' : 'danger'}>
                          {dlq.reprocessed ? 'REPROCESSED' : 'IN DLQ'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!dlq.reprocessed && (
                          <Button size="sm" variant="secondary" onClick={() => handleReprocessDlq(dlq.eventId)} icon={RotateCw}>
                            Safe Reprocess
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Dead Letter Queue is empty. No permanent failures recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Processing Logs */}
      {activeTab === 'logs' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" /> Kafka Reliability Audit Logs
            </span>
            <button
              onClick={() => dispatch(clearProcessingLogs())}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Logs
            </button>
          </div>
          <div className="p-4 bg-slate-950 font-mono text-xs max-h-96 overflow-y-auto space-y-1.5 text-slate-300">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px]">
                  <span className="text-slate-500 shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span
                    className={`shrink-0 font-bold ${
                      log.status === 'SUCCESS'
                        ? 'text-emerald-400'
                        : log.status === 'FAILED_TO_DLQ'
                        ? 'text-rose-400'
                        : log.status === 'DUPLICATE_IGNORED'
                        ? 'text-purple-400'
                        : 'text-amber-400'
                    }`}
                  >
                    [{log.status}]
                  </span>
                  <span className="text-indigo-400 shrink-0">[{log.eventId}]</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6">No logs available.</p>
            )}
          </div>
        </Card>
      )}

      {/* Tab 5: Automated Test Report */}
      {activeTab === 'tests' && (
        <Card>
          <CardHeader
            title="Automated Reliability Verification Suite"
            subtitle="Deterministic verification of all four reliability scenarios"
            action={
              <Button size="sm" onClick={() => handleRunTests('ALL')} loading={testRunning} icon={Play}>
                Rerun Test Suite
              </Button>
            }
          />
          {testReport ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Scenarios</p>
                  <p className="text-xl font-bold">{testReport.totalTests}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Passed</p>
                  <p className="text-xl font-bold text-emerald-500">{testReport.passedTests}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Failed</p>
                  <p className="text-xl font-bold text-rose-500">{testReport.failedTests}</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {testReport.results.map((r, i) => (
                  <div key={i} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{r.scenario}</span>
                        <Badge variant={r.status === 'PASS' ? 'success' : 'danger'}>{r.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{r.details}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">Event: {r.eventId}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Button onClick={() => handleRunTests('ALL')} loading={testRunning}>
                Run Initial Test Suite
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Retry Config */}
      {activeTab === 'config' && (
        <Card className="max-w-xl">
          <CardHeader title="Dynamic Retry Parameters" subtitle="Adjust exponential backoff parameters on-the-fly" />
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Retry Attempts
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Interval (ms)
              </label>
              <input
                type="number"
                step={500}
                min={500}
                value={initialIntervalMs}
                onChange={(e) => setInitialIntervalMs(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Backoff Multiplier
              </label>
              <input
                type="number"
                step={0.5}
                min={1.0}
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <Button type="submit">Update Configuration</Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default KafkaReliabilityDashboard;
